import json
import os
import glob
from datetime import datetime

CONFIG_PREFIX = "subscriber_config"

def main():
    print("=== One Smarter Quant: Subscriber Initial Setup ===")
    
    # Check if a config already exists
    existing_configs = glob.glob(f"{CONFIG_PREFIX}*.json")
    if existing_configs:
        print(f"Found existing configuration(s): {', '.join(existing_configs)}")
        choice = input("Do you want to create a new configuration? (y/n): ").strip().lower()
        if choice != 'y':
            print("Setup cancelled. Exiting.")
            return

    print("\nPlease enter your preferences.")
    
    # Entry Convention
    while True:
        entry = input("Entry Convention [published_weight, equal_weight]: ").strip().lower()
        if entry in ["published_weight", "equal_weight"]:
            break
        print("Invalid choice. Please enter 'published_weight' or 'equal_weight'.")

    # Fractional Shares
    while True:
        frac = input("Allow Fractional Shares? (y/n): ").strip().lower()
        if frac in ['y', 'n']:
            fractional_shares = (frac == 'y')
            break
        print("Please enter 'y' or 'n'.")

    # Min Trade Notional
    while True:
        try:
            val = input("Minimum Trade Size Notional (USD) [e.g., 5.0]: ").strip()
            min_trade = float(val)
            if min_trade >= 0:
                break
            print("Value must be a positive number.")
        except ValueError:
            print("Please enter a valid number.")

    timestamp = datetime.now().isoformat()
    
    config = {
        "entry_convention": entry,
        "fractional_shares": fractional_shares,
        "min_trade_notional_usd": min_trade,
        "timestamp": timestamp
    }
    
    # We write to a new timestamped file to preserve history
    formatted_ts = timestamp.replace(":", "").replace("-", "").split(".")[0]
    filename = f"{CONFIG_PREFIX}_{formatted_ts}.json"
    
    # We also update or create a symlink/copy to the standard subscriber_config.json 
    # so the app always reads the latest without complex logic.
    with open(filename, "w") as f:
        json.dump(config, f, indent=4)
        
    with open("subscriber_config.json", "w") as f:
        json.dump(config, f, indent=4)
        
    print(f"\nConfiguration successfully saved to {filename}")
    print("History is preserved. subscriber_config.json is updated to the latest.")

if __name__ == "__main__":
    main()
