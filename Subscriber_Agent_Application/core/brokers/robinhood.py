from .base import BaseBroker
from decimal import Decimal
import logging

class RobinhoodBroker(BaseBroker):
    """
    A robust, modular implementation for Robinhood.
    """
    def __init__(self, label, username, password, live=False):
        super().__init__(label, live, username=username, password=password)
        self.username = username
        self.password = password
        self.logged_in = False
        self._login()

    def _login(self):
        try:
            import robin_stocks.robinhood as r
            r.login(self.username, self.password, expiresIn=86400, by_sms=True)
            self.logged_in = True
        except ImportError:
            logging.error("robin_stocks is not installed. Please run: pip install robin_stocks")
        except Exception as e:
            logging.error(f"Failed to login to Robinhood: {e}")

    def snapshot(self, quotes=None):
        if not self.logged_in:
            return {"cash_usd": 0.0, "positions": {}, "position_opened": {}}
        try:
            import robin_stocks.robinhood as r
            profile = r.profiles.load_account_profile()
            cash = float(profile.get('buying_power', 0.0))
            
            open_positions = r.account.get_open_stock_positions()
            parsed_positions = {}
            for p in open_positions:
                symbol = r.stocks.get_symbol_by_url(p['instrument'])
                parsed_positions[symbol] = {"shares": float(p['quantity'])}
                
            return {
                "cash_usd": cash,
                "positions": parsed_positions,
                "position_opened": {}
            }
        except Exception as e:
            logging.error(f"Robinhood snapshot error: {e}")
            return {"cash_usd": 0.0, "positions": {}, "position_opened": {}}

    def equity(self, quotes=None):
        if not self.logged_in:
            return Decimal("0.0")
        try:
            import robin_stocks.robinhood as r
            profile = r.profiles.load_portfolio_profile()
            return Decimal(profile.get('equity', "0.0"))
        except Exception as e:
            logging.error(f"Robinhood equity error: {e}")
            return Decimal("0.0")

    def submit(self, orders, quotes, session):
        if not self.logged_in:
            return [{"status": "REJECTED", "reason": "Robinhood not logged in", **o} for o in orders]
            
        fills = []
        try:
            import robin_stocks.robinhood as r
            for o in orders:
                symbol = o['symbol']
                qty = float(o['shares'])
                if o['side'] == 'BUY':
                    res = r.orders.order_buy_market(symbol, qty)
                else:
                    res = r.orders.order_sell_market(symbol, qty)
                    
                if 'id' in res:
                    fills.append({**o, "status": "SUBMITTED", "broker_id": res['id']})
                else:
                    fills.append({**o, "status": "REJECTED", "reason": str(res)})
        except Exception as e:
            logging.error(f"Robinhood submit error: {e}")
            
        return fills
