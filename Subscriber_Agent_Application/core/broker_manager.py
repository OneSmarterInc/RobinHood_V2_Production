import json
import os
import keyring
from .brokers.mock import MockBroker
# from .brokers.alpaca import AlpacaBroker
# from .brokers.tradier import TradierBroker

# The boss requested live adapters stay in the repository for later, 
# but they MUST NOT be reachable from the build that gets demonstrated.

CONFIG_FILE = os.path.join(os.getcwd(), "brokers.json")
KEYRING_SERVICE = "SubscriberAgent_BrokerSecrets"

class BrokerManager:
    def __init__(self, config_path=CONFIG_FILE):
        self.config_path = config_path
        self.brokers_config = self._load_config()

    def _load_config(self):
        if os.path.exists(self.config_path):
            with open(self.config_path, "r") as f:
                return json.load(f)
        # Default config
        return {
            "active_broker": "mock_default",
            "brokers": {
                "mock_default": {
                    "type": "mock",
                    "label": "Mock Broker ($50k)",
                    "cash_usd": 50000,
                    "positions": {}
                }
            }
        }

    def _save_config(self):
        with open(self.config_path, "w") as f:
            json.dump(self.brokers_config, f, indent=4)

    def get_brokers(self):
        return self.brokers_config["brokers"]
        
    def get_active_broker_id(self):
        return self.brokers_config.get("active_broker", "mock_default")

    def get_active_broker(self):
        active_id = self.get_active_broker_id()
        broker_data = self.brokers_config["brokers"].get(active_id)
        if not broker_data:
            return None
            
        b_type = broker_data.get("type")
        
        # DEMONSTRATION BUILD: ONLY MOCK ADAPTER IS REACHABLE
        if b_type == "mock":
            return MockBroker(
                label=broker_data.get("label", "Mock"),
                cash_usd=broker_data.get("cash_usd", 50000),
                positions=broker_data.get("positions", {})
            )
        
        # --- DISABLED FOR COMPLIANCE REVIEW ---
        # elif b_type == "alpaca":
        #     return AlpacaBroker(
        #         label=broker_data.get("label", "Alpaca"),
        #         api_key=broker_data.get("api_key", ""),
        #         api_secret=broker_data.get("api_secret", "")
        #     )

        
        # elif b_type == "tradier":
        #     return TradierBroker(
        #         label=broker_data.get("label", "Tradier"),
        #         access_token=broker_data.get("access_token", "")
        #     )
        # --------------------------------------
            
        # Any other broker type is forcefully rejected in the compliance build
        raise ValueError(f"Live trading adapter '{b_type}' is disabled for the compliance demonstration build.")

    def add_broker(self, broker_id, config):
        # Extract secrets and store in OS keyring instead of plaintext JSON
        secrets = config.pop("secrets", {})
        for key, secret_value in secrets.items():
            keyring.set_password(KEYRING_SERVICE, f"{broker_id}_{key}", secret_value)
            
        self.brokers_config["brokers"][broker_id] = config
        self._save_config()

    def get_broker_secret(self, broker_id, key):
        return keyring.get_password(KEYRING_SERVICE, f"{broker_id}_{key}")

    def set_active_broker(self, broker_id):
        if broker_id in self.brokers_config["brokers"]:
            self.brokers_config["active_broker"] = broker_id
            self._save_config()
            return True
        return False
