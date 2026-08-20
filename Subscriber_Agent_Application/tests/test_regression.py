import unittest
import sys
import os
from datetime import date, timedelta

# Add core to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from core.policy_engine import compute_orders

class TestTenSessionRegression(unittest.TestCase):
    def test_ten_sessions(self):
        account = {
            "cash_usd": 10000.0,
            "positions": {},
            "sold_today": []
        }
        
        quotes = {
            "XLK": 100.0,
            "XLF": 50.0,
            "XLE": 80.0,
            "XLV": 120.0,
            "XLI": 70.0
        }
        
        target_sequence = [
            {"XLK": 25.0, "XLF": 25.0},
            {"XLK": 25.0, "XLF": 25.0},
            {"XLK": 25.0, "XLE": 25.0},
            {"XLK": 25.0, "XLE": 25.0},
            {"XLE": 25.0, "XLV": 25.0},
            {},
            {"XLI": 25.0, "XLK": 25.0, "XLF": 25.0},
            {"XLI": 25.0, "XLK": 25.0, "XLF": 25.0, "XLE": 25.0},
            {"XLI": 25.0, "XLK": 25.0, "XLF": 25.0, "XLE": 25.0, "XLV": 25.0},
            {"XLI": 25.0, "XLK": 25.0, "XLF": 25.0, "XLV": 25.0},
            {"XLI": 25.0, "XLK": 25.0, "XLF": 25.0, "XLV": 25.0, "XLE": 25.0}
        ]
        
        current_date = date(2026, 8, 1)
        
        for i, targets in enumerate(target_sequence):
            if i != 10: 
                current_date += timedelta(days=1)
                account["sold_today"] = []
                
            document = {
                "constraints": {
                    "max_positions": 4,
                    "entry_weight_pct": 25.0,
                    "entry_weight_basis": "current_equity",
                    "position_weight_cap_pct": None,
                    "maintenance_rebalancing": "none",
                    "same_session_reentry": "blocked"
                },
                "targets": {
                    "positions": targets
                }
            }
            
            res = compute_orders(document, account, quotes, current_date)
            
            for order in res["orders"]:
                sym = order["symbol"]
                if order["side"] == "BUY":
                    account["cash_usd"] -= order["notional_usd"]
                    if sym not in account["positions"]:
                        account["positions"][sym] = {"shares": 0.0}
                    account["positions"][sym]["shares"] += order["shares"]
                elif order["side"] == "SELL":
                    account["cash_usd"] += order["notional_usd"]
                    account["positions"].pop(sym, None)
                    account["sold_today"].append(sym)
                    
            if i == 0:
                self.assertIn("XLK", account["positions"])
                self.assertIn("XLF", account["positions"])
            elif i == 1:
                self.assertEqual(len(res["orders"]), 0)
            elif i == 2:
                self.assertNotIn("XLF", account["positions"])
                self.assertIn("XLE", account["positions"])
            elif i == 3:
                self.assertEqual(len(res["orders"]), 0)
            elif i == 5:
                self.assertEqual(len(account["positions"]), 0)
            elif i == 8:
                self.assertEqual(len(account["positions"]), 4)
                self.assertNotIn("XLV", account["positions"])
                self.assertTrue(any("max_positions" in note for note in res["holds"]))
            elif i == 10:
                self.assertTrue(any("re-entry blocked" in note for note in res["holds"]))
                self.assertNotIn("XLE", account["positions"])

if __name__ == "__main__":
    unittest.main()
