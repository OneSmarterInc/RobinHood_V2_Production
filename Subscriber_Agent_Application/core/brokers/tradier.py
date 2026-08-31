from .base import BaseBroker
from decimal import Decimal
import logging
import requests

class TradierBroker(BaseBroker):
    def __init__(self, label, access_token, live=False):
        super().__init__(label, live, access_token=access_token)
        self.access_token = access_token
        self.base_url = "https://api.tradier.com/v1" if live else "https://sandbox.tradier.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Accept": "application/json"
        }
        self.account_id = self._get_account_id()

    def _get_account_id(self):
        if not self.access_token: return None
        try:
            res = requests.get(f"{self.base_url}/user/profile", headers=self.headers)
            if res.ok:
                data = res.json()
                accounts = data.get("profile", {}).get("account", [])
                if isinstance(accounts, dict):
                    accounts = [accounts]
                if accounts:
                    return accounts[0].get("account_number")
        except Exception as e:
            logging.error(f"Tradier fetch account error: {e}")
        return None

    def snapshot(self, quotes=None):
        if not self.account_id:
            return {"cash_usd": 0.0, "positions": {}, "position_opened": {}}
            
        try:
            res = requests.get(f"{self.base_url}/accounts/{self.account_id}/balances", headers=self.headers)
            res.raise_for_status()
            balances = res.json().get("balances", {})
            cash = float(balances.get("total_cash", 0.0))
            
            pos_res = requests.get(f"{self.base_url}/accounts/{self.account_id}/positions", headers=self.headers)
            pos_res.raise_for_status()
            pos_data = pos_res.json().get("positions", {})
            
            parsed_positions = {}
            if pos_data and pos_data != 'null':
                positions_list = pos_data.get("position", [])
                if isinstance(positions_list, dict):
                    positions_list = [positions_list]
                for p in positions_list:
                    parsed_positions[p["symbol"]] = {"shares": float(p["quantity"])}
                
            return {
                "cash_usd": cash,
                "positions": parsed_positions,
                "position_opened": {}
            }
        except Exception as e:
            logging.error(f"Tradier snapshot error: {e}")
            return {"cash_usd": 0.0, "positions": {}, "position_opened": {}}

    def equity(self, quotes=None):
        if not self.account_id:
            return Decimal("0.0")
        try:
            res = requests.get(f"{self.base_url}/accounts/{self.account_id}/balances", headers=self.headers)
            res.raise_for_status()
            balances = res.json().get("balances", {})
            return Decimal(str(balances.get("total_equity", "0.0")))
        except Exception as e:
            logging.error(f"Tradier equity error: {e}")
            return Decimal("0.0")

    def submit(self, orders, quotes, session):
        if not self.account_id:
            return [{"status": "REJECTED", "reason": "Tradier credentials missing", **o} for o in orders]
            
        fills = []
        for o in orders:
            try:
                side = "buy" if o['side'] == 'BUY' else "sell"
                payload = {
                    "class": "equity",
                    "symbol": o['symbol'],
                    "side": side,
                    "quantity": str(o['shares']),
                    "type": "market",
                    "duration": "day"
                }
                res = requests.post(f"{self.base_url}/accounts/{self.account_id}/orders", headers=self.headers, data=payload)
                if res.ok:
                    data = res.json().get("order", {})
                    if data.get("status") == "ok":
                        fills.append({**o, "status": "SUBMITTED", "broker_id": str(data.get("id"))})
                    else:
                        fills.append({**o, "status": "REJECTED", "reason": str(data.get("errors"))})
                else:
                    fills.append({**o, "status": "REJECTED", "reason": res.text})
            except Exception as e:
                logging.error(f"Failed to submit Tradier order for {o['symbol']}: {e}")
                fills.append({**o, "status": "REJECTED", "reason": str(e)})
        return fills
