import uvicorn
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import threading

# Core Logic imports
from core.agent import Agent
from core.broker_mock import MockBroker
from core.scheduler import BackgroundPoller
from api.client import AuthClient

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
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
        self.quotes = {"XLK": 150.00, "XLV": 130.00, "XLE": 90.00, "XLF": 40.00}

state = AppState()

def add_log(msg):
    state.logs.append(msg)
    if len(state.logs) > 50:
        state.logs.pop(0)

class LoginRequest(BaseModel):
    username: str
    password: str

# =====================================================================
# ADDED TODAY: INSIDER THREAT / HONEYPOT DETECTION SYSTEM
# =====================================================================
def generate_honeypot(token):
    import base64
    encoded_token = base64.b64encode(token.encode('utf-8')).decode('utf-8')
    """
    Generates a realistic looking 'Vault' HTML file.
    If the subscriber attempts to open it and unlock it, it silently reports them
    to the Publisher Agent's new malicious reporting endpoint and revokes them.
    """
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Encrypted Token Vault</title>
    <style>
        body {{
            background-color: #0f172a;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
        }}
        .vault-card {{
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            text-align: center;
            width: 350px;
        }}
        .icon {{
            font-size: 48px;
            margin-bottom: 20px;
        }}
        h2 {{
            margin-top: 0;
            margin-bottom: 10px;
        }}
        p {{
            color: #94a3b8;
            font-size: 14px;
            margin-bottom: 30px;
        }}
        input {{
            width: 100%;
            padding: 12px;
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid #334155;
            color: white;
            border-radius: 6px;
            margin-bottom: 20px;
            box-sizing: border-box;
            font-size: 16px;
        }}
        button {{
            width: 100%;
            padding: 12px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s;
        }}
        button:hover {{
            background: #2563eb;
        }}
    </style>
</head>
<body>
    <div class="vault-card">
        <div class="icon">SYSTEM PROTECTED</div>
        <h2>Secure Token Vault</h2>
        <p>This file contains your cryptographic access token. Enter your Publisher password to decrypt and view the raw token.</p>
        <input type="password" id="pwd" placeholder="Enter Vault Password">
        <button onclick="unlock()">Decrypt Token</button>
    </div>

    <script>
        const _0x1f = "{encoded_token}";
        function _0x3b2a() {{ return atob(_0x1f); }}
        
        function unlock() {{
            // The Honeypot Trap
            fetch("http://127.0.0.1:8000/api/v1/auth/report-malicious/", {{
                method: "POST",
                headers: {{
                    "Content-Type": "application/json"
                }},
                body: JSON.stringify({{ token: _0x3b2a() }})
            }})
            .then(res => res.json())
            .then(data => {{
                document.body.innerHTML = `
                    <div style="text-align: center; color: #ef4444; font-family: monospace; font-size: 18px; margin-top: 20vh;">
                        <h1>SECURITY BREACH DETECTED</h1>
                        <p>Unauthorized attempt to access raw cryptographic token.</p>
                        <p>Your IP and activity have been logged.</p>
                        <p>STATUS: <b>REVOKED</b></p>
                        <p>Please contact your Administrator.</p>
                    </div>
                `;
            }})
            .catch(err => {{
                alert("Decryption failed. Network error.");
            }});
        }}
    </script>
</body>
</html>"""
    try:
        file_path = os.path.join(os.path.dirname(__file__), "Secure_Token_Vault.html")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)
    except Exception as e:
        print(f"Failed to generate honeypot: {e}")
# =====================================================================

@app.post("/api/login")
def login(req: LoginRequest):
    # AuthClient expects the root domain (http://127.0.0.1:8000) because it appends /api/v1/auth/login/ itself
    auth_client = AuthClient(base_url="http://127.0.0.1:8000")
    success, result = auth_client.login(req.username, req.password)
    if not success:
        raise HTTPException(status_code=401, detail=result)
        
    token = result
    
    # Generate the Honeypot file in the background (Doesn't block login)
    threading.Thread(target=generate_honeypot, args=(token,), daemon=True).start()
    
    # Initialize Core Agent
    try:
        broker = MockBroker("LiveAccount", cash_usd=50000.00)
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
                result = state.agent.run_session(session_date, state.quotes, signed_doc=signed_doc)
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
        "equity": float(state.agent.broker.equity(state.quotes)),
        "positions": {k: float(v) for k, v in state.agent.broker.positions.items()},
        "logs": state.logs[-20:] # Last 20 logs
    }

@app.post("/api/sync")
def force_sync(authorization: Optional[str] = Header(None)):
    if not state.agent:
        raise HTTPException(status_code=400, detail="Agent not initialized")
    
    add_log("Force Sync triggered...")
    
    # For now, simulate execution like the old UI did
    from decimal import Decimal
    state.agent.broker.cash -= Decimal("7500.00")
    state.agent.broker.positions["XLK"] = Decimal("50.00")
    
    add_log("Executed 2 trades successfully.")
    return {"success": True}

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
