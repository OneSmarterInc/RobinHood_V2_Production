import os
import json
import time
import requests
import threading
from datetime import datetime

class BackgroundPoller:
    def __init__(self, base_url, token, on_new_target=None, on_error=None, poll_interval=10):
        """
        base_url: The Django backend URL
        token: The subscriber's authentication token
        on_new_target: Callback function when a new target is downloaded
        on_error: Callback function for API errors
        poll_interval: How often to check the API (seconds)
        """
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.on_new_target = on_new_target
        self.on_error = on_error
        self.poll_interval = poll_interval
        self.is_running = False
        self.target_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "TargetPortfolio"))
        
        # Ensure the directory exists
        os.makedirs(self.target_dir, exist_ok=True)
        
    def start(self):
        if not self.is_running:
            self.is_running = True
            threading.Thread(target=self._poll_loop, daemon=True).start()
            
    def stop(self):
        self.is_running = False
        
    def _poll_loop(self):
        while self.is_running:
            self._check_for_updates()
            time.sleep(self.poll_interval)
            
    def _check_for_updates(self):
        url = f"{self.base_url}/targets/latest/"
        headers = {"Authorization": f"Token {self.token}"}
        
        try:
            response = requests.get(url, headers=headers, timeout=5)
            if response.status_code == 200:
                data = response.json()
                
                # Extract sequence without verifying signature (just for filename check)
                # Version 3 JSON structure has it in plain text under 'document'.
                # NOTE: Sequence is read purely to build the filename before verification.
                document = data.get("document", {})
                
                seq = document.get("sequence", 0)
                
                file_name = f"target_seq_{seq}.json"
                file_path = os.path.join(self.target_dir, file_name)
                
                # Check if we already downloaded this sequence's target
                if os.path.exists(file_path):
                    return # Already have it, do nothing
                
                # Save it
                with open(file_path, "w") as f:
                    json.dump(data, f, indent=4)
                    
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Downloaded new target ({file_name}) to {file_path}")
                
                # Trigger callback if set
                if self.on_new_target:
                    self.on_new_target(file_path)
                    
            elif response.status_code == 404:
                # No target published yet for today
                pass
            else:
                error_msg = f"API Error {response.status_code}: {response.text}"
                print(error_msg)
                if hasattr(self, 'on_error') and self.on_error:
                    self.on_error(error_msg)
                
        except requests.exceptions.RequestException as e:
            error_msg = f"Connection error: {e}"
            print(error_msg)
            if hasattr(self, 'on_error') and self.on_error:
                self.on_error(error_msg)
