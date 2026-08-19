import json
from datetime import timedelta
from django.utils import timezone
from PublisherApp.models import PublishedJson
from PublisherApp.PortfolioMathEngine.math_engine import MathEngine
from PublisherApp.PortfolioMathEngine.portfolio_rules import PortfolioRulesEngine
from PublisherApp.PortfolioMathEngine.crypto_signer import CryptoSigner
import os

class JSONPublisher:
    """
    The Orchestrator: Combines Math, Rules, and Security to generate the final JSON.
    """
    
    def __init__(self):
        # In a real app, this key should be loaded from os.getenv("PUBLISHER_PRIVATE_KEY_HEX")
        # For development, we will generate a fresh key if not provided
        private_key = os.getenv("PUBLISHER_PRIVATE_KEY_HEX")
        self.signer = CryptoSigner(private_key_hex=private_key)
        
    def run_publisher_cycle(self):
        """
        Runs the full cycle: Math -> Rules -> JSON -> Sign -> Database
        """
        print("1. Running Math Engine...")
        math_engine = MathEngine()
        regime = math_engine.calculate_regime()
        momentum_rankings = math_engine.calculate_momentum_rankings()
        
        print("2. Applying Portfolio Rules...")
        rules_engine = PortfolioRulesEngine(regime, momentum_rankings)
        portfolio = rules_engine.build_and_save_portfolio()
        
        print("3. Building Version_2 JSON Schema...")
        json_data = self._build_json_payload(portfolio)
        
        # We need the canonical string (sorted keys, no spaces) to sign
        canonical_json_string = json.dumps(json_data, sort_keys=True, separators=(',', ':'))
        
        print("4. Applying Cryptographic Signatures...")
        sha256_hash = self.signer.hash_message(canonical_json_string)
        signature = self.signer.sign_message(canonical_json_string)
        
        # Build the final massive JSON structure
        final_document = {
            "document": json_data,
            "integrity": {
                "canonicalization": "json.dumps(sort_keys=True, separators=(',',':'))",
                "sha256": sha256_hash,
                "signature_alg": "Ed25519",
                "signature": signature,
                "key_id": "publisher-2026-08"
            }
        }
        
        final_json_string = json.dumps(final_document, indent=2)
        
        print("5. Saving to Database and File...")
        # Save JSON physically
        file_name = f"target_{portfolio.effective_session.strftime('%Y_%m_%d')}.json"
        os.makedirs("published_targets", exist_ok=True)
        json_path = os.path.join("published_targets", file_name)
        
        with open(json_path, 'w') as f:
            f.write(final_json_string)
            
        # Save to Database so the API can serve it
        PublishedJson.objects.create(
            portfolio=portfolio,
            json_path=json_path,
            signature=signature,
            sha256_hash=sha256_hash,
            key_id="publisher-2026-08",
            url=f"/static/targets/{file_name}"
        )
        
        print("CYCLE COMPLETE! New Signed JSON target is ready.")
        return final_json_string

    def _build_json_payload(self, portfolio):
        """
        Constructs the exact 'document' block dictionary from the Version_2 demo.
        """
        # Get positions
        positions = {}
        for pos in portfolio.positions.all():
            positions[pos.symbol] = pos.target_percentage
            
        now = timezone.now()
        
        # Session bound validity (closes at 4:00 PM)
        session_str = portfolio.effective_session.isoformat()
        valid_until_str = f"{session_str}T16:00:00-04:00"
        
        # Calculate next trading day (skip weekends)
        next_day = portfolio.effective_session + timedelta(days=1)
        if next_day.weekday() >= 5: # 5=Sat, 6=Sun
            next_day += timedelta(days=(7 - next_day.weekday()))
        next_publish_str = f"{next_day.isoformat()}T09:15:00-04:00"
        
        document = {
            "schema_version": "1.0.0",
            "model_id": portfolio.model_id,
            "portfolio": {
                "portfolio_id": "core",
                "sleeve_allocation_pct": 100.0
            },
            "sequence": portfolio.sequence,
            "published_at": now.isoformat(),
            "effective_session": session_str,
            "valid_from": now.isoformat(),
            "valid_until": valid_until_str,
            "liveness": {
                "model_evaluated": True,
                "evaluated_at": now.isoformat(),
                "next_expected_publish": next_publish_str
            },
            "execution_window": {
                "start": "10:00:00-04:00",
                "end": "10:30:00-04:00",
                "entry": "randomized_within_window",
                "publisher_executes": "last, from this document, no priority"
            },
            "regime": {
                "argus1_band": portfolio.regime,
                "flowos_phase": portfolio.phase
            },
            "targets": {
                "positions": positions,
                "cash_pct": portfolio.cash_percentage
            },
            "constraints": {
                "max_positions": 4,
                "entry_weight_pct": 25.0,
                "entry_weight_basis": "current_equity",
                "position_weight_cap_pct": None,
                "maintenance_rebalancing": "none",
                "same_session_reentry": "blocked"
            },
            "rationale": f"System determined {portfolio.regime} regime. Executed fully systematic sector rotation logic."
        }
        
        return document
