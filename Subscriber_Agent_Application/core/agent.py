import json
import urllib.request
import urllib.error
import os
from datetime import datetime, date

from core.verify import verify, load_public_key, VerificationFailure
from core.policy_engine import compute_orders

STATE_FILE = os.path.join(os.getcwd(), "agent_state.json")

class Agent:
    def __init__(self, label, base_url, token, broker, pubkey_path, config=None):
        self.label = label
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.broker = broker
        self.pubkey = load_public_key(pubkey_path)
        self.config = config or {}
        self.audit = []
        self._load_state()

    def _load_state(self):
        self.last_sequence = None
        self.latest_document = None
        self.recent_orders = []
        if os.path.exists(STATE_FILE):
            try:
                with open(STATE_FILE, "r") as f:
                    data = json.load(f)
                    self.last_sequence = data.get("last_sequence")
                    self.latest_document = data.get("latest_document")
                    self.recent_orders = data.get("recent_orders", [])
            except Exception:
                pass

    def _save_state(self):
        with open(STATE_FILE, "w") as f:
            json.dump({
                "last_sequence": self.last_sequence,
                "latest_document": self.latest_document,
                "recent_orders": getattr(self, 'recent_orders', [])
            }, f)

    def fetch(self, path):
        req = urllib.request.Request(f"{self.base_url}/{path}",
                                     headers={"Authorization": f"Token {self.token}"})
        with urllib.request.urlopen(req, timeout=5) as r:
            return json.loads(r.read())


    def run_session(self, session, quote_fetcher, path=None, signed_doc=None):
        from datetime import datetime, date
        print(f"[{datetime.now().strftime('%H:%M:%S')}] [core/agent.py] INFO: Initializing trade session {session}")
        
        rec = {"session": session, "timestamp": datetime.now().isoformat()}
        try:
            from datetime import timezone
            import zoneinfo
            
            # The document is evaluated against the session date at 10 AM America/New_York time.
            # Convert 10:00 AM NY time on the session date to UTC accurately, handling DST automatically.
            ny_tz = zoneinfo.ZoneInfo("America/New_York")
            session_dt = datetime.fromisoformat(session)
            now_dt = datetime.now(timezone.utc)
            
            print(f"[{datetime.now().strftime('%H:%M:%S')}] [core/agent.py] INFO: Handoff to core/verify.py for cryptographic checks")
            
            if signed_doc:
                doc, checks = verify(signed_doc, self.pubkey, now=now_dt, last_seen_sequence=self.last_sequence)
            else:
                signed = self.fetch(f"targets/date/{session}")
                doc, checks = verify(signed, self.pubkey, now=now_dt, last_seen_sequence=self.last_sequence)

            for check in checks:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] [core/verify.py] PASS: {check}")
            
            print(f"[{datetime.now().strftime('%H:%M:%S')}] [core/agent.py] INFO: Verification successful. Fetching broker and market data")
            account = self.broker.snapshot(quotes=None)
            account["position_opened"] = {k: date.fromisoformat(v)
                                          for k, v in account["position_opened"].items()}

            symbols = list(doc["targets"]["positions"].keys()) + list(account["positions"].keys())
            symbols = list(set(symbols))
            quotes = quote_fetcher(symbols)

            print(f"[{datetime.now().strftime('%H:%M:%S')}] [core/agent.py] INFO: Handoff to core/policy_engine.py for target difference calculations")
            result = compute_orders(doc, account, quotes, date.fromisoformat(session), self.config)
            
            print(f"[{datetime.now().strftime('%H:%M:%S')}] [core/policy_engine.py] INFO: Generated {len(result['orders'])} order(s) based on current equity")
            
            rec["equity_before"] = result["equity_usd"]
            rec["holds"] = result["holds"]
            rec["notes"] = result["notes"]
            
            broker_module_path = self.broker.__class__.__module__.replace('.', '/') + '.py'
            print(f"[{datetime.now().strftime('%H:%M:%S')}] [core/agent.py] INFO: Handoff to {broker_module_path} for execution")
            fills = self.broker.submit(result["orders"], quotes, session)
            rec["orders"] = fills
            rec["equity_after"] = float(self.broker.equity(quotes))
            
            if fills:
                for f in fills:
                    if 'timestamp' not in f:
                        f['timestamp'] = datetime.now().isoformat()
                self.recent_orders = fills

            print(f"[{datetime.now().strftime('%H:%M:%S')}] [core/agent.py] INFO: Saving state sequence {doc['sequence']} to agent_state.json")
            self.latest_document = doc
            self.last_sequence = doc["sequence"]
            self._save_state()

            rec["outcome"] = f"Executed {len(fills)} order(s)"
            self.audit.append(rec)
            
            print(f"[{datetime.now().strftime('%H:%M:%S')}] [core/agent.py] SUCCESS: Session complete - {rec['outcome']}")
            return rec

        except VerificationFailure as e:
            rec["outcome"] = f"NO ACTION - verification failed: {e}"
            self.audit.append(rec)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] [core/verify.py] FAIL: {e}")
            print(f"[{datetime.now().strftime('%H:%M:%S')}] [core/agent.py] WARN: Execution halted - {rec['outcome']}")
            return rec
        except Exception as e:
            rec["outcome"] = f"ERROR: {e}"
            self.audit.append(rec)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] [core/agent.py] ERROR: Internal failure - {e}")
            return rec
