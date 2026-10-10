"""Password hashing (PBKDF2, stdlib only) and stateless bearer tokens (HMAC).

No sessions table: a token is `"{user_id}.{hmac_signature}"`. Cheap to verify,
nothing to clean up, good enough for a hackathon demo.
"""

from __future__ import annotations

import hashlib
import hmac
import secrets

from .config import settings

_PBKDF2_ITERATIONS = 200_000


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), _PBKDF2_ITERATIONS)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, hex_digest = stored.split("$", 1)
    except ValueError:
        return False
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), _PBKDF2_ITERATIONS)
    return hmac.compare_digest(digest.hex(), hex_digest)


def _sign(payload: str) -> str:
    return hmac.new(settings.secret_key.encode(), payload.encode(), hashlib.sha256).hexdigest()


def create_token(user_id: int) -> str:
    payload = str(user_id)
    return f"{payload}.{_sign(payload)}"


def verify_token(token: str) -> int | None:
    try:
        payload, signature = token.split(".", 1)
    except ValueError:
        return None
    if not hmac.compare_digest(signature, _sign(payload)):
        return None
    try:
        return int(payload)
    except ValueError:
        return None
