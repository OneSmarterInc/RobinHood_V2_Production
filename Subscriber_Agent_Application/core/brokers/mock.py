"""
Subscriber side. The broker adapter.

This is the only component in the entire system that holds broker credentials,
and it lives on the subscriber's side. In production it wraps the subscriber's
own agentic brokerage connection. Here it is a simulator.

The adapter refuses to operate in anything but dry-run unless explicitly
constructed with live=True, which this demonstration never does. A compliance
demonstration that is capable of placing a real order is a hazard, not a
feature.
"""

from decimal import Decimal, ROUND_DOWN


from .base import BaseBroker, LiveTradingRefused

class MockBroker(BaseBroker):
    def __init__(self, label, cash_usd, positions=None, opened=None, live=False):
        super().__init__(label, live)
        if live:
            raise LiveTradingRefused(
                "This adapter is a simulator. It has no credentials and cannot "
                "reach a broker. Live execution requires a different adapter, "
                "which is deliberately not present in this package.")
        self.label = label
        self.cash = Decimal(str(cash_usd))
        self.positions = {k: Decimal(str(v)) for k, v in (positions or {}).items()}
        self.opened = dict(opened or {})
        self.fills = []

    # --- read side: what the subscriber's agent can see about its own account
    def snapshot(self, quotes):
        return {
            "cash_usd": float(self.cash),
            "positions": {s: {"shares": float(q)} for s, q in self.positions.items() if q > 0},
            "position_opened": dict(self.opened),
        }

    def equity(self, quotes):
        e = self.cash
        for s, q in self.positions.items():
            e += q * Decimal(str(quotes[s]))
        return e

    # --- write side: dry-run only
    def submit(self, orders, quotes, session):
        """Simulates fills at the quoted price. Returns a fill record."""
        filled = []
        for o in orders:
            sym = o["symbol"]
            price = Decimal(str(quotes[sym]))
            shares = Decimal(str(o["shares"]))
            if o["side"] == "BUY":
                cost = (shares * price).quantize(Decimal("0.01"), rounding=ROUND_DOWN)
                if cost > self.cash:
                    filled.append({**o, "status": "REJECTED", "reason": "insufficient cash"})
                    continue
                self.cash -= cost
                self.positions[sym] = self.positions.get(sym, Decimal(0)) + shares
                if sym not in self.opened:
                    self.opened[sym] = session
                filled.append({**o, "status": "FILLED", "price": float(price)})
            else:
                held = self.positions.get(sym, Decimal(0))
                shares = min(shares, held)
                proceeds = (shares * price).quantize(Decimal("0.01"), rounding=ROUND_DOWN)
                self.cash += proceeds
                self.positions[sym] = held - shares
                if self.positions[sym] <= Decimal("0.0001"):
                    self.positions.pop(sym, None)
                    self.opened.pop(sym, None)
                filled.append({**o, "status": "FILLED", "price": float(price)})
        self.fills.extend([{"session": session, **f} for f in filled])
        return filled
