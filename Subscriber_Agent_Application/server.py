import uvicorn
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import threading

# Core Logic imports
from core.agent import Agent
from core.quote_provider import fetch_previous_close_quotes
from core.broker_manager import BrokerManager
broker_manager = BrokerManager()
from core.scheduler import BackgroundPoller
from api.client import AuthClient

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8001", "http://127.0.0.1:8001"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the compiled React Frontend
dist_dir = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")
    
    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(dist_dir, "index.html"))


# Global State for the Desktop App (since it's a single-user local app)
class AppState:
    def __init__(self):
        self.agent = None
        self.poller = None
        self.logs = ["Waiting for automated sync..."]
        self.base_url = "http://127.0.0.1:8000/api/v1"
        self.pubkey_path = "../publisher_agent/feed/keys/publisher-2026-07.pub"
        

state = AppState()

def add_log(msg):
    state.logs.append(msg)
    if len(state.logs) > 50:
        state.logs.pop(0)

class LoginRequest(BaseModel):
    username: str
    password: str

# =====================================================================

@app.post("/api/login")
def login(req: LoginRequest):
    # AuthClient expects the root domain (http://127.0.0.1:8000) because it appends /api/v1/auth/login/ itself
    auth_client = AuthClient(base_url="http://127.0.0.1:8000")
    success, result = auth_client.login(req.username, req.password)
    if not success:
        raise HTTPException(status_code=401, detail=result)
        
    token = result
    
    # Initialize Core Agent
    try:
        broker = broker_manager.get_active_broker()
        state.agent = Agent("MyAccount", state.base_url, token, broker, state.pubkey_path, config={"entry_convention": "equal_weight"})
        
        # Start Poller
        if state.poller:
            state.poller.stop()
            
        def handle_new_target(file_path):
            add_log(f"New Target Downloaded: {file_path}")
            try:
                import json
                with open(file_path, "r") as f:
                    signed_doc = json.load(f)
                
                # Extract session date for verification engine
                session_date = signed_doc.get("document", {}).get("effective_session")
                if not session_date:
                    raise ValueError("Missing effective_session in document")
                    
                # Run the agent session (this triggers verification + execution)
                result = state.agent.run_session(session_date, fetch_previous_close_quotes, signed_doc=signed_doc)
                add_log(f"Verification & Execution: {result['outcome']}")
            except Exception as e:
                add_log(f"Execution Error: {str(e)}")

        state.poller = BackgroundPoller(
            state.base_url, 
            token, 
            on_new_target=handle_new_target, 
            on_error=lambda err: add_log(f"Poller Error: {err}"),
            poll_interval=10
        )
        state.poller.start()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent Init Failed: {str(e)}")
        
    return {"token": token}

@app.get("/api/status")
def get_status(authorization: Optional[str] = Header(None)):
    if not state.agent:
        return {"status": "NOT INITIALIZED", "equity": 0, "positions": {}, "logs": state.logs}
        
    return {
        "status": "SYSTEM ACTIVE",
        "equity": float(state.agent.broker.equity(fetch_previous_close_quotes)),
        "positions": {k: float(v) for k, v in state.agent.broker.positions.items()},
        "logs": state.logs[-20:], # Last 20 logs
        "latest_document": state.agent.latest_document
    }

@app.post("/api/sync")
def force_sync(authorization: Optional[str] = Header(None)):
    if not state.agent:
        raise HTTPException(status_code=400, detail="Agent not initialized")
    
    add_log("Manual Sync triggered...")
    
    try:
        # Perform a real fetch from the publisher
        data = state.agent.fetch("targets/latest/")
        session_date = data.get("document", {}).get("effective_session")
        if not session_date:
            raise ValueError("Missing effective_session in fetched document")
            
        result = state.agent.run_session(session_date, fetch_previous_close_quotes, signed_doc=data)
        add_log(f"Verification & Execution: {result['outcome']}")
        
        # Save it for the UI to pick up as the latest file
        import os, json
        target_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "TargetPortfolio"))
        os.makedirs(target_dir, exist_ok=True)
        formatted_date = session_date.replace("-", "_")
        file_path = os.path.join(target_dir, f"target_{formatted_date}.json")
        with open(file_path, "w") as f:
            json.dump(data, f, indent=4)
            
        return {"success": True, "outcome": result['outcome']}
    except Exception as e:
        error_msg = f"Sync Error: {str(e)}"
        add_log(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)


@app.get("/api/calendar")
def get_calendar(year: int, month: int, authorization: Optional[str] = Header(None)):
    import pandas_market_calendars as mcal
    import pandas as pd
    from datetime import date
    import datetime
    
    try:
        nyse = mcal.get_calendar('NYSE')
        start_date = f"{year}-{month:02d}-01"
        
        # Get last day of the month
        if month == 12:
            end_date = f"{year}-12-31"
        else:
            next_month = date(year, month + 1, 1)
            last_day = next_month - datetime.timedelta(days=1)
            end_date = last_day.strftime("%Y-%m-%d")
            
        schedule = nyse.schedule(start_date=start_date, end_date=end_date)
        trading_days = [d.strftime("%Y-%m-%d") for d in schedule.index]
        
        return {
            "year": year,
            "month": month,
            "trading_days": trading_days
        }
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Calendar Error: {str(e)}")


from pydantic import BaseModel
class BrokerConfig(BaseModel):
    id: str
    type: str
    label: str
    api_key: str = ""
    api_secret: str = ""
    cash_usd: float = 50000.0

@app.get("/api/brokers")
def get_brokers(authorization: Optional[str] = Header(None)):
    return {
        "active": broker_manager.get_active_broker_id(),
        "brokers": broker_manager.get_brokers()
    }

@app.post("/api/brokers")
def add_broker(config: BrokerConfig, authorization: Optional[str] = Header(None)):
    broker_manager.add_broker(config.id, config.dict(exclude={"id"}))
    return {"status": "ok"}

@app.post("/api/brokers/active")
def set_active_broker(broker_id: str, authorization: Optional[str] = Header(None)):
    success = broker_manager.set_active_broker(broker_id)
    if success:
        # Re-initialize agent with new broker if logged in
        if state.agent:
            state.agent.broker = broker_manager.get_active_broker()
        return {"status": "ok"}
    from fastapi import HTTPException
    raise HTTPException(status_code=400, detail="Invalid broker ID")

@app.get("/api/latest-target")
def get_latest_target(authorization: Optional[str] = Header(None)):
    target_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "TargetPortfolio"))
    if not os.path.exists(target_dir):
        return {"filename": None, "raw_json": None, "document": None}
        
    files = [f for f in os.listdir(target_dir) if f.startswith("target_") and f.endswith(".json")]
    if not files:
        return {"filename": None, "raw_json": None, "document": None}
        
    # Sort files to get the latest (by name: target_2026_08_13.json)
    files.sort(reverse=True)
    latest_file = files[0]
    
    file_path = os.path.join(target_dir, latest_file)
    try:
        with open(file_path, "r") as f:
            raw_content = f.read()
            
        import json
        parsed = json.loads(raw_content)
        document = parsed.get("document", {})
        
        return {
            "filename": latest_file,
            "raw_json": raw_content,
            "document": document
        }
    except Exception as e:
        return {"filename": latest_file, "raw_json": f"Error reading file: {str(e)}", "document": None}

def run_server():
    config = uvicorn.Config(app, host="127.0.0.1", port=8001, log_level="error")
    server = uvicorn.Server(config)
    
    # Disable signal handlers to prevent ValueError when running in a thread
    import contextlib
    with contextlib.suppress(ValueError):
        server.run()
