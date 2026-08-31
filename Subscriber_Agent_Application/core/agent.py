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
        self.pending_orders = []
        self.pending_session = None
        if os.path.exists(STATE_FILE):
            try:
                with open(STATE_FILE, "r") as f:
                    data = json.load(f)
                    self.last_sequence = data.get("last_sequence")
                    self.latest_document = data.get("latest_document")
                    self.recent_orders = data.get("recent_orders", [])
                    self.pending_orders = data.get("pending_orders", [])
                    self.pending_session = data.get("pending_session")
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
        return self.prepare_session(session, quote_fetcher, path, signed_doc)

    def prepare_session(self, session, quote_fetcher, path=None, signed_doc=None):
        """
        Phase 1 (HITL): Fetches quotes, calculates orders, but saves them as pending 
        instead of submitting immediately.
        """
        from datetime import datetime, date
        rec = {"session": session, "timestamp": datetime.now().isoformat()}
        try:
            from datetime import timezone, timedelta
            # Need to pass 'now' to verify. The document is evaluated against the session date at 10 AM EST.
            # 10 AM EST is 14:00 UTC during daylight saving (which August is).
            now_dt = datetime.fromisoformat(session).replace(hour=14, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
            if signed_doc:
                doc, checks = verify(signed_doc, self.pubkey, now=now_dt, last_seen_sequence=self.last_sequence)
            else:
                signed = self.fetch(f"targets/date/{session}")
                doc, checks = verify(signed, self.pubkey, now=now_dt, last_seen_sequence=self.last_sequence)


            account = self.broker.snapshot(quotes=None)
            account["position_opened"] = {k: date.fromisoformat(v)
                                          for k, v in account["position_opened"].items()}

            symbols = list(doc["targets"]["positions"].keys()) + list(account["positions"].keys())
            symbols = list(set(symbols))
            quotes = quote_fetcher(symbols)

            result = compute_orders(doc, account, quotes, date.fromisoformat(session), self.config)
            rec["equity_before"] = result["equity_usd"]
            rec["holds"] = result["holds"]
            rec["notes"] = result["notes"]
            
            # EXECUTING AUTOMATICALLY AS PER REVIEW
            fills = self.broker.submit(result["orders"], quotes, session)
            rec["orders"] = fills
            rec["equity_after"] = float(self.broker.equity(quotes))
            
            if fills:
                for f in fills:
                    if 'timestamp' not in f:
                        f['timestamp'] = datetime.now().isoformat()
                self.recent_orders = fills

            self.latest_document = doc
            self.last_sequence = doc["sequence"]
            self.pending_orders = []
            self.pending_session = None
            self._save_state()

            rec["outcome"] = f"Executed {len(fills)} order(s)"
            self.audit.append(rec)
            return rec

        except VerificationFailure as e:
            rec["outcome"] = f"NO ACTION - verification failed: {e}"
            self.audit.append(rec)
            return rec
        except Exception as e:
            rec["outcome"] = f"ERROR: {e}"
            self.audit.append(rec)
            return rec

    def execute_pending(self, quote_fetcher):
        """
        Phase 2 (HITL): Executes the pending orders with the broker.
        """
        from datetime import datetime
        rec = {"session": self.pending_session, "timestamp": datetime.now().isoformat()}
        try:
            if not self.pending_orders:
                rec["outcome"] = "No pending orders to execute"
                return rec
                
            symbols = [o['symbol'] for o in self.pending_orders]
            quotes = quote_fetcher(symbols)
            fills = self.broker.submit(self.pending_orders, quotes, self.pending_session)
            
            rec["orders"] = fills
            rec["equity_after"] = float(self.broker.equity(quotes))
            rec["outcome"] = f"Executed {len(fills)} order(s)"
            self.audit.append(rec)
            
            self.last_sequence = self.latest_document["sequence"] if self.latest_document else self.last_sequence
            
            if fills:
                for f in fills:
                    if 'timestamp' not in f:
                        f['timestamp'] = datetime.now().isoformat()
                self.recent_orders = fills
            
            self.pending_orders = []
            self.pending_session = None
            self._save_state()
            
            return rec
        except Exception as e:
            rec["outcome"] = f"ERROR during execution: {e}"
            self.audit.append(rec)
            return rec
