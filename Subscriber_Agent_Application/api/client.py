import os
import requests

class AuthClient:
    def __init__(self, base_url="http://127.0.0.1:8000"):
        self.base_url = base_url
        self.token_file = "token.txt"

    def login(self, username, password):
        """
        Sends credentials to the Django Publisher Backend to receive an API Token.
        """
        url = f"{self.base_url}/api/v1/auth/login/"
        payload = {
            "username": username,
            "password": password
        }
        
        try:
            response = requests.post(url, json=payload, timeout=5)
            if response.status_code == 200:
                data = response.json()
                token = data.get("token")
                if token:
                    self.save_token(token)
                    return True, token
            
            # If not 200, return the error message from the API
            error_msg = response.json().get("error", "Invalid credentials")
            return False, error_msg
            
        except requests.exceptions.RequestException as e:
            return False, f"Connection error: Cannot reach the publisher server."
            
    def get_token(self):
        """Retrieves the saved token if it exists."""
        if os.path.exists(self.token_file):
            with open(self.token_file, "r") as f:
                return f.read().strip()
        return None
        
    def save_token(self, token):
        """Saves the token securely to disk."""
        with open(self.token_file, "w") as f:
            f.write(token)
            
    def logout(self):
        """Deletes the local token."""
        if os.path.exists(self.token_file):
            os.remove(self.token_file)
