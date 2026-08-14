"""
Subscriber side. Verifies a fetched document before anything is allowed to
act on it. Fail-closed at every step: an unverified, stale, or out-of-order
document produces no orders, not a best guess.
"""

import json
import hashlib
from datetime import datetime

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature


class VerificationFailure(Exception):
    pass


def load_public_key(path):
    return serialization.load_pem_public_key(open(path, "rb").read())


def verify(signed, public_key, now, last_seen_sequence=None):
    """Returns the inner document, or raises. Every raise means 'do not trade'."""
    body = signed["document"]
    integrity = signed["integrity"]
    checks = []

    canonical = json.dumps(body, sort_keys=True, separators=(",", ":")).encode()

    digest = hashlib.sha256(canonical).hexdigest()
    if digest != integrity["sha256"]:
        raise VerificationFailure("content hash mismatch")
    checks.append("sha256 matches")

    try:
        public_key.verify(bytes.fromhex(integrity["signature"]), canonical)
    except InvalidSignature:
        raise VerificationFailure("Ed25519 signature invalid: document is not from the publisher")
    checks.append(f"Ed25519 signature valid (key_id={integrity['key_id']})")

    valid_from = datetime.fromisoformat(body["valid_from"])
    valid_until = datetime.fromisoformat(body["valid_until"])
    if not (valid_from <= now <= valid_until):
        raise VerificationFailure(
            f"document outside validity window ({body['valid_from']} to {body['valid_until']})")
    checks.append("inside validity window")

    if not body.get("liveness", {}).get("model_evaluated"):
        raise VerificationFailure("liveness assertion absent: publisher did not confirm evaluation")
    checks.append("liveness asserted by publisher")

    if last_seen_sequence is not None and body["sequence"] <= last_seen_sequence:
        raise VerificationFailure(
            f"replay or stale sequence (got {body['sequence']}, already saw {last_seen_sequence})")
    checks.append(f"sequence {body['sequence']} is forward of last seen")

    return body, checks
