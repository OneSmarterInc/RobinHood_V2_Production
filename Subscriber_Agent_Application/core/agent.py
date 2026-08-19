"""
Subscriber side. The daily loop, end to end.

    fetch -> verify -> read own account -> compute -> submit (dry-run) -> log

The agent persists only one thing between sessions: the highest document
sequence it has already acted on. That single number is what makes replay
impossible and what lets an agent that was offline for a week rejoin without
replaying anything.
"""

import json
import urllib.request
import urllib.error
from datetime import datetime, date

from core.verify import verify, load_public_key, VerificationFailure
from core.policy_engine import compute_orders


class Agent:
    def __init__(self, label, base_url, token, broker, pubkey_path, config=None):
        self.label = label
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.broker = broker
        self.pubkey = load_public_key(pubkey_path)
        self.config = config or {}
        self.last_sequence = None
        self.latest_document = None
        self.audit = []

    def fetch(self, path):
        req = urllib.request.Request(f"{self.base_url}/{path}",
                                     headers={"Authorization": f"Token {self.token}"})
        with urllib.request.urlopen(req, timeout=5) as r:
            return json.loads(r.read())

    def run_session(self, session, quotes, path=None, signed_doc=None):
        """One trading session. Returns a record of what happened and why."""
        rec = {"session": session, "subscriber": self.label, "orders": [],
               "holds": [], "notes": [], "outcome": None}

        if signed_doc is not None:
            signed = signed_doc
        else:
            try:
                signed = self.fetch(path or f"models/rotation-core/{session}.json")
            except urllib.error.HTTPError as e:
                rec["outcome"] = f"NO ACTION - feed returned {e.code}: {json.loads(e.read())['error']}"
                self.audit.append(rec)
                return rec
            except Exception as e:
                rec["outcome"] = f"NO ACTION - feed unreachable ({e})"
                self.audit.append(rec)
                return rec

        now = datetime.fromisoformat(f"{session}T10:05:00-04:00")
        try:
            doc, checks = verify(signed, self.pubkey, now, self.last_sequence)
        except VerificationFailure as e:
            rec["outcome"] = f"NO ACTION - verification failed: {e}"
            self.audit.append(rec)
            return rec

        rec["sequence"] = doc["sequence"]
        rec["regime"] = f"{doc['regime']['argus1_band']}/{doc['regime']['flowos_phase']}"
        rec["targets"] = doc["targets"]["positions"]

        account = self.broker.snapshot(quotes)
        account["position_opened"] = {k: date.fromisoformat(v)
                                      for k, v in account["position_opened"].items()}

        result = compute_orders(doc, account, quotes, date.fromisoformat(session), self.config)
        rec["equity_before"] = result["equity_usd"]
        rec["holds"] = result["holds"]
        rec["notes"] = result["notes"]

        fills = self.broker.submit(result["orders"], quotes, session)
        rec["orders"] = fills
        rec["equity_after"] = float(self.broker.equity(quotes))
        rec["outcome"] = f"{len(fills)} order(s)" if fills else "no orders"

        self.last_sequence = doc["sequence"]
        self.latest_document = doc # Save the raw document to display on UI
        self.audit.append(rec)
        return rec
