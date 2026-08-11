from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
import hashlib

class CryptoSigner:
    """
    Handles Ed25519 Cryptographic signing and SHA256 hashing to ensure
    the JSON targets cannot be tampered with by hackers.
    """
    
    def __init__(self, private_key_hex=None):
        if private_key_hex:
            # Load existing key
            private_bytes = bytes.fromhex(private_key_hex)
            self.private_key = ed25519.Ed25519PrivateKey.from_private_bytes(private_bytes)
        else:
            # Generate new key
            self.private_key = ed25519.Ed25519PrivateKey.generate()
            
    def get_private_key_hex(self):
        """Returns the private key as a hex string so it can be saved in .env safely."""
        private_bytes = self.private_key.private_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PrivateFormat.Raw,
            encryption_algorithm=serialization.NoEncryption()
        )
        return private_bytes.hex()
        
    def get_public_key_hex(self):
        """Returns the public key as a hex string (what the Desktop App uses to verify)."""
        public_key = self.private_key.public_key()
        public_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )
        return public_bytes.hex()

    def sign_message(self, message_string):
        """
        Signs the JSON string using Ed25519 and returns the signature hex.
        """
        message_bytes = message_string.encode('utf-8')
        signature = self.private_key.sign(message_bytes)
        return signature.hex()
        
    def hash_message(self, message_string):
        """
        Generates a SHA256 hash of the JSON string.
        """
        message_bytes = message_string.encode('utf-8')
        return hashlib.sha256(message_bytes).hexdigest()
