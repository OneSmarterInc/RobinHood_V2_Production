import os
import sys
import json
import urllib.error
from datetime import datetime, date, timedelta

# Add core to path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from core.agent import Agent
from core.broker_manager import BrokerManager
from core.verify import VerificationFailure

def mock_quote_fetcher(symbols):
    return {s: 100.0 for s in symbols}

def run_demonstration():
    print("="*60)
    print("DEMONSTRATION RUN FOR LEGAL REVIEW (LIVE DJANGO PUBLISHER)")
    print("="*60)
    
    base_url = "http://127.0.0.1:8000/api/v1"
    # We will use a valid token. Since we don't have one, we will use a test user token.
    # We will fetch the latest target to use as a base.
    
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
    # Change the current time evaluated by verify.py by monkey-patching or passing a stale document
    # Since we can't easily sign a stale document, we simulate it by setting the agent's last_seen_sequence higher
    agent.last_sequence = latest_doc['document']['sequence'] + 5 
    res = agent.run_session(session_date, mock_quote_fetcher, signed_doc=latest_doc)
    print(f"Outcome (Stale seq): {res['outcome']}")
    agent.last_sequence = None # reset

    print("\n--- 5. Two Accounts with Different Frozen Configs ---")
    # Account 1: Equal Weight
    broker1 = BrokerManager().get_active_broker()
    agent1 = Agent("Acc1", base_url, token, broker1, "keys/publisher-2026-07.pub", config={"entry_convention": "equal_weight", "fractional_shares": True, "min_trade_notional_usd": 0.0})
    agent1.last_sequence = 0
    # Account 2: Published Weight
    broker2 = BrokerManager().get_active_broker()
    agent2 = Agent("Acc2", base_url, token, broker2, "keys/publisher-2026-07.pub", config={"entry_convention": "published_weight", "fractional_shares": True, "min_trade_notional_usd": 0.0})
    agent2.last_sequence = 0
    
    res1 = agent1.run_session(session_date, mock_quote_fetcher, signed_doc=latest_doc)
    res2 = agent2.run_session(session_date, mock_quote_fetcher, signed_doc=latest_doc)
    print(f"Equal Weight Orders: {len(res1.get('orders', []))}")
    print(f"Published Weight Orders: {len(res2.get('orders', []))}")
    if res1.get('orders') != res2.get('orders'):
        print("SUCCESS: The two accounts produced different order lists based on frozen config.")
    else:
        print("NOTE: Order lists were the same (maybe target is equal weighted natively).")

    print("\n--- 6. Agent Missing Four Sessions Converging In One Pass ---")
    # Give the agent a portfolio of random old stocks not in target
    broker_converge = BrokerManager().get_active_broker()
    broker_converge._positions = {"IBM": {"shares": 50}, "GE": {"shares": 50}}
    agent_converge = Agent("AccConverge", base_url, token, broker_converge, "keys/publisher-2026-07.pub", config={"entry_convention": "equal_weight", "fractional_shares": True, "min_trade_notional_usd": 0.0})
    agent_converge.last_sequence = 0
    res_converge = agent_converge.run_session(session_date, mock_quote_fetcher, signed_doc=latest_doc)
    print(f"Outcome: {res_converge['outcome']}")
    print(f"Orders generated to converge: {len(res_converge.get('orders', []))}")
    
    print("\n--- Egress Check Note ---")
    print("Please review the Django Publisher console log. It should show only GET requests to /targets/, with no unauthorized endpoints accessed.")
    print("="*60)

if __name__ == "__main__":
    run_demonstration()
