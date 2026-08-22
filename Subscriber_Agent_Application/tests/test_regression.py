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


    def test_held_positions_identical_to_targets(self):
        """
        Start the account with two positions and some cash, then run a document whose target set is identical 
        to what is held. The correct result is zero orders and two hold lines reading 'already held, no maintenance rebalancing'.
        """
        account = {
            "cash_usd": 5000.0,
            "positions": {
                "XLK": {"shares": 25.0},
                "XLF": {"shares": 50.0}
            },
            "sold_today": []
        }
        
        quotes = {
            "XLK": 100.0,
            "XLF": 50.0
        }
        
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
                "positions": {"XLK": 25.0, "XLF": 25.0}
            }
        }
        
        res = compute_orders(document, account, quotes, date(2026, 8, 1))
        
        self.assertEqual(len(res["orders"]), 0)
        
        # Check hold lines
        xlk_hold = next((h for h in res["holds"] if "XLK" in h), "")
        xlf_hold = next((h for h in res["holds"] if "XLF" in h), "")
        
        self.assertTrue("already held, no maintenance rebalancing" in xlk_hold.lower())
        self.assertTrue("already held, no maintenance rebalancing" in xlf_hold.lower())

    def test_held_position_not_in_targets_liquidated(self):
        """
        Account holds a symbol the document does not mention. The correct result is a single sell.
        """
        account = {
            "cash_usd": 5000.0,
            "positions": {
                "TSLA": {"shares": 10.0}
            },
            "sold_today": []
        }
        
        quotes = {
            "TSLA": 200.0,
            "XLK": 100.0
        }
        
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
                "positions": {}
            }
        }
        
        res = compute_orders(document, account, quotes, date(2026, 8, 1))
        
        # Expect exactly 1 sell (TSLA) and no buys
        self.assertEqual(len(res["orders"]), 1)
        self.assertEqual(res["orders"][0]["side"], "SELL")
        self.assertEqual(res["orders"][0]["symbol"], "TSLA")

if __name__ == "__main__":

    unittest.main()
