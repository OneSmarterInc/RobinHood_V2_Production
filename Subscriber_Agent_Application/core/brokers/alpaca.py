from .base import BaseBroker
from decimal import Decimal
import logging
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce

import time

class AlpacaBroker(BaseBroker):
    """
    Robust implementation for Alpaca API using the official alpaca-py SDK.
    """
    def __init__(self, label, api_key, api_secret, base_url="https://paper-api.alpaca.markets", live=False):
        super().__init__(label, live, api_key=api_key, api_secret=api_secret)
        self.api_key = api_key
        self.api_secret = api_secret
        # paper=True if live=False
        self.client = TradingClient(api_key=api_key, secret_key=api_secret, paper=not live) if api_key and api_secret else None
        
        # Caching to prevent rate limit and DNS exhaustion from rapid UI polling
        self._cache = {"snapshot": None, "equity": None}
        self._last_fetch = {"snapshot": 0, "equity": 0}
        self.CACHE_TTL = 10  # Cache for 10 seconds

    def snapshot(self, quotes=None):
        """Fetches live account cash and positions from Alpaca."""
        if not self.client:
            return {"cash_usd": 0.0, "positions": {}, "position_opened": {}}
            
        now = time.time()
        if self._cache["snapshot"] and (now - self._last_fetch["snapshot"]) < self.CACHE_TTL:
            return self._cache["snapshot"]
            
        try:
            account = self.client.get_account()
            cash = float(account.cash)
            
            positions_data = self.client.get_all_positions()
            parsed_positions = {}
            for p in positions_data:
                parsed_positions[p.symbol] = {"shares": float(p.qty)}
                
            res = {
                "cash_usd": cash,
                "positions": parsed_positions,
                "position_opened": {}
            }
            self._cache["snapshot"] = res
            self._last_fetch["snapshot"] = now
            return res
        except Exception as e:
            # Only log if it's not a temporary DNS/timeout blip, or just return cache if available
            if self._cache["snapshot"]:
                return self._cache["snapshot"]
            logging.error(f"Alpaca snapshot error: {e}")
            return {"cash_usd": 0.0, "positions": {}, "position_opened": {}}

    def equity(self, quotes=None):
        """Calculates live equity using Alpaca's calculated equity."""
        if not self.client:
            return Decimal("0.0")
            
        now = time.time()
        if self._cache["equity"] and (now - self._last_fetch["equity"]) < self.CACHE_TTL:
            return self._cache["equity"]
            
        try:
            account = self.client.get_account()
            res = Decimal(str(account.equity))
            self._cache["equity"] = res
            self._last_fetch["equity"] = now
            return res
        except Exception as e:
            if self._cache["equity"]:
                return self._cache["equity"]
            logging.error(f"Alpaca equity error: {e}")
            return Decimal("0.0")

    def submit(self, orders, quotes, session):
        """Submits real or paper orders to Alpaca."""
        if not self.client:
            return [{"status": "REJECTED", "reason": "Alpaca credentials missing", **o} for o in orders]
            
        fills = []
        for o in orders:
            try:
                side = OrderSide.BUY if o['side'] == 'BUY' else OrderSide.SELL
                req = MarketOrderRequest(
                    symbol=o['symbol'],
                    qty=float(o['shares']),
                    side=side,
                    time_in_force=TimeInForce.DAY
                )
                res = self.client.submit_order(req)
                fills.append({**o, "status": "SUBMITTED", "broker_id": str(res.id)})
            except Exception as e:
                logging.error(f"Failed to submit Alpaca order for {o['symbol']}: {e}")
                fills.append({**o, "status": "REJECTED", "reason": str(e)})
        return fills
