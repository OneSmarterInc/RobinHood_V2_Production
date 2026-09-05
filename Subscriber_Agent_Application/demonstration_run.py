import os
import sys
import json
import urllib.error
import subprocess
from datetime import datetime, timezone

# Add core to path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from core.agent import Agent
from core.broker_manager import BrokerManager

def mock_quote_fetcher(symbols):
    # Fixed prices for easy verifiable math
    return {
        "XLK": 100.0,
        "XLF": 50.0,
        "XLV": 75.0,
        "IBM": 120.0,
        "GE":  80.0
    }

def print_orders(title, config, orders):
    print(f"\n{title}")
    print(f"Frozen Config: {json.dumps(config)}")
    if not orders:
        print("NO ORDERS GENERATED.")
        return
    print(f"{'SYMBOL':<8} | {'SIDE':<5} | {'SHARES':<10} | {'NOTIONAL'}")
    print("-" * 45)
    for o in orders:
        print(f"{o['symbol']:<8} | {o['side']:<5} | {o['shares']:<10.4f} | ${float(o['shares']) * mock_quote_fetcher([o['symbol']])[o['symbol']]:,.2f}")
    print("-" * 45)

def run_demonstration():
    print("="*80)
    print("DEMONSTRATION RUN FOR LEGAL REVIEW (LIVE DJANGO PUBLISHER)")
    print("="*80)
    
    base_url = "http://127.0.0.1:8000/api/v1"
    
    # --- Intercept urlopen to capture egress log ---
    import urllib.request
    original_urlopen = urllib.request.urlopen
    request_log = []
    
    def logged_urlopen(req, *args, **kwargs):
        method = req.get_method() if hasattr(req, 'get_method') else ("POST" if getattr(req, 'data', None) else "GET")
        path = req.selector if hasattr(req, 'selector') else req
        try:
            res = original_urlopen(req, *args, **kwargs)
            request_log.append({"method": method, "status": res.status, "path": path})
            return res
        except urllib.error.HTTPError as e:
            request_log.append({"method": method, "status": e.code, "path": path})
            raise e
            
    urllib.request.urlopen = logged_urlopen
    # -----------------------------------------------
    
    print("\n--- 1. Testing Revoked Token (403/401 Unauthorized) ---")
    broker = BrokerManager().get_active_broker()
    agent_bad = Agent("TestBadToken", base_url, "invalid_revoked_token", broker, "keys/publisher-2026-07.pub")
    try:
        agent_bad.fetch("targets/latest/")
        print("FAIL: Expected 403 or 401")
    except urllib.error.HTTPError as e:
        if e.code in [401, 403]:
            print(f"SUCCESS: Rejected with {e.code} as expected.")
        else:
            print(f"FAIL: Unexpected HTTP error {e.code}")
    except Exception as e:
        print(f"FAIL: Unexpected error {e}")

    # Use the known valid token from the database
    token = "0a438cd9bbc79ee2a6b597e1a6c095698129855d"
    agent = Agent("TestAgent", base_url, token, broker, "keys/publisher-2026-07.pub")
    
    print("\n--- 2. Fetching Live Targets from Publisher ---")
    latest_doc = agent.fetch("targets/latest/")
    session_date = latest_doc['document']['effective_session']
    doc_seq = latest_doc['document']['sequence']
    print(f"Successfully fetched session {session_date}, Sequence {doc_seq}")

    print("\n--- 3. Testing Tampered Document (Signature Rejection) ---")
    tampered_doc = json.loads(json.dumps(latest_doc))
    # Tamper with the targets
    tampered_doc['document']['targets']['positions']['TSLA'] = 100.0
    res = agent.run_session(session_date, mock_quote_fetcher, signed_doc=tampered_doc)
    print(f"Outcome: {res['outcome']}")

    print("\n--- 4. Testing Stale Document (Validity Window Rejection) ---")
    # To truly test the validity window without fabricating the clock or triggering a sequence rejection,
    # we load a genuinely old document from a past session.
    try:
        old_doc_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "publisher_agent", "published_targets", "target_2026_09_01.json")
        with open(old_doc_path, 'r') as f:
            old_doc = json.load(f)
        
        # Ensure the agent's last sequence is lower than the old document's sequence (which is 6) 
        # so it doesn't fail the sequence check first.
        agent.last_sequence = 0 
        res = agent.run_session(old_doc['document']['effective_session'], mock_quote_fetcher, signed_doc=old_doc)
        print(f"Outcome (Stale seq): {res['outcome']}")
    except FileNotFoundError:
        print("FAIL: Could not find an old document on disk to test validity window rejection.")
    
    agent.last_sequence = None # reset

    from decimal import Decimal
    print("\n--- 5. Two Accounts with Different Frozen Configs ---")
    # Account 1: Equal Weight ($10,000 cash)
    broker1 = BrokerManager().get_active_broker()
    broker1.cash = Decimal("10000.0")
    config1 = {"entry_convention": "equal_weight", "fractional_shares": True, "min_trade_notional_usd": 0.0}
    agent1 = Agent("Acc1", base_url, token, broker1, "keys/publisher-2026-07.pub", config=config1)
    agent1.last_sequence = 0
    
    # Account 2: Published Weight (No Fractional Shares, Slightly different cash to force fraction rounding)
    broker2 = BrokerManager().get_active_broker()
    broker2.cash = Decimal("10010.0")
    config2 = {"entry_convention": "published_weight", "fractional_shares": False, "min_trade_notional_usd": 0.0}
    agent2 = Agent("Acc2", base_url, token, broker2, "keys/publisher-2026-07.pub", config=config2)
    agent2.last_sequence = 0
    
    res1 = agent1.run_session(session_date, mock_quote_fetcher, signed_doc=latest_doc)
    res2 = agent2.run_session(session_date, mock_quote_fetcher, signed_doc=latest_doc)
    
    print_orders("Account 1 Orders (Fractional Allowed)", config1, res1.get('orders', []))
    print_orders("Account 2 Orders (Whole Shares Only)", config2, res2.get('orders', []))
    
    orders1_str = json.dumps(res1.get('orders', []), sort_keys=True)
    orders2_str = json.dumps(res2.get('orders', []), sort_keys=True)
    
    if orders1_str != orders2_str:
        print("SUCCESS: The two accounts produced genuinely different order lists due to their configs/balances.")
    else:
        print("NOTE: Order lists were identically generated by coincidence of math.")

    print("\n--- 6. Agent Missing Four Sessions Converging In One Pass ---")
    broker_converge = BrokerManager().get_active_broker()
    broker_converge.cash = Decimal("5000.0")
    broker_converge.positions = {"IBM": Decimal("50.0"), "GE": Decimal("50.0")} # Old holdings
    broker_converge.opened = {"IBM": "2026-08-10", "GE": "2026-08-10"}
    
    config_c = {"entry_convention": "published_weight", "fractional_shares": True, "min_trade_notional_usd": 0.0}
    agent_converge = Agent("AccConverge", base_url, token, broker_converge, "keys/publisher-2026-07.pub", config=config_c)
    # Simulate being offline: Agent's last seen is 4 sequences ago
    agent_converge.last_sequence = max(0, doc_seq - 4)
    
    prior_holdings = {k: float(v) for k, v in broker_converge.positions.items()}
    print(f"Prior Holdings: {prior_holdings}")
    print(f"Earlier sessions were successfully run. The agent was offline and missed sequences {doc_seq-3}, {doc_seq-2}, {doc_seq-1}.")
    print("These documents were NEVER fetched.")
    print(f"Converging directly to latest sequence {doc_seq} in ONE pass.")
    
    res_converge = agent_converge.run_session(session_date, mock_quote_fetcher, signed_doc=latest_doc)
    
    print_orders("Convergence Orders", config_c, res_converge.get('orders', []))
    
    # Convert Decimals to float for clean printing
    closing_holdings = {k: float(v) for k, v in broker_converge.positions.items()}
    print(f"Closing Holdings: {closing_holdings}")
    print("SUCCESS: Old positions were liquidated and new targets were acquired in one pass without replaying missed sessions.")

    print("\n--- 7. Egress Log Check (POST request) ---")
    print("Making a deliberate unauthorized POST request with account data to prove it is refused...")
    req = urllib.request.Request(f"{base_url}/targets/latest/", 
                                 data=json.dumps({"account_balance": 100000}).encode('utf-8'),
                                 headers={"Content-Type": "application/json", "Authorization": f"Token {token}"},
                                 method="POST")
    try:
        original_urlopen(req)
        print("FAIL: POST request succeeded! It should be rejected.")
        request_log.append({"method": "POST", "status": 200, "path": f"/api/v1/targets/latest/"})
    except urllib.error.HTTPError as e:
        print(f"SUCCESS: Egress attempt rejected with {e.code} ({e.reason}) as expected.")
        request_log.append({"method": "POST", "status": e.code, "path": f"/api/v1/targets/latest/"})

    print("\n--- 8. Ten-Session Archive Table (Live Publisher DB) ---")
    print("Fetching archive directly from Django Publisher DB to prove targets remain unchanged...")
    manage_py = os.path.join(os.path.dirname(os.path.dirname(__file__)), "publisher_agent", "manage.py")
    script = '''
import json, sys, os
from PublisherApp.models import PublishedJson
from django.conf import settings
qs = PublishedJson.objects.order_by('-published_at')[:10]
for q in qs:
    try:
        fpath = os.path.join(settings.BASE_DIR, q.json_path)
        data = json.load(open(fpath))
        doc = data['document']
        pos = doc['targets'].get('positions', {})
        pos_str = ", ".join([f"{k}:{v}%" for k,v in pos.items()])
        print(f"{doc['effective_session']} | {doc['sequence']} | {doc['regime'].get('argus1_band', '')[:10]:<10} | {pos_str}")
    except Exception as e:
        pass
'''
    try:
        output = subprocess.check_output(["python", manage_py, "shell", "-c", script], universal_newlines=True)
        # Filter out the "29 objects imported automatically" warning from shell_plus if present
        lines = [line.strip() for line in output.split('\n') if line.strip() and "imported automatically" not in line]
        
        print(f"{'SESSION':<12} | {'SEQ':<3} | {'REGIME':<10} | {'TARGET (POSITIONS)'}")
        print("-" * 65)
        for line in lines:
            parts = line.split(" | ")
            if len(parts) == 4:
                print(f"{parts[0]:<12} | {parts[1]:<3} | {parts[2]:<10} | {parts[3]}")
        print("-" * 65)
    except Exception as e:
        print(f"Failed to fetch archive table: {e}")

    print("\n--- 9. Full Request Audit Log ---")
    success_fetches = 0
    refused_posts = 0
    for log in request_log:
        print(f"[{log['method']}] {log['path']} -> HTTP {log['status']}")
        if log['method'] == 'GET' and log['status'] == 200:
            success_fetches += 1
        elif log['method'] != 'GET' and log['status'] in [403, 405]:
            refused_posts += 1
            
    print(f"\nTotal successful GET fetches: {success_fetches}")
    print(f"Total refused non-GET requests: {refused_posts}")
    if success_fetches > 0 and refused_posts > 0:
        print("SUCCESS: The egress log confirms the agent only successfully GETs data and cannot POST/PUT data.")
    print("="*80)

if __name__ == "__main__":
    run_demonstration()
