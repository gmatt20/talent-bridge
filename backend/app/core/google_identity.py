"""Verifies the ID tokens issued by the "Sign in with Google" button."""

import dataclasses

from google.auth import exceptions as google_exceptions
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from app.core import config


class InvalidGoogleTokenError(Exception):
    """The Google ID token is forged, expired, or for an unverified email."""


@dataclasses.dataclass(frozen=True)
class GoogleProfile:
    """The parts of a verified Google account that sign-in uses.

    Attributes:
        email: The account's verified email address, lowercased.
        name: The account's display name, or "" if Google sent none.
    """

    email: str
    name: str


def verify_id_token(credential: str) -> GoogleProfile:
    """Returns the Google account an ID token was issued to.

    Checks the token's signature against Google's public keys, its expiry and
    issuer, and that it was issued for this app's OAuth client.

    Args:
        credential: The ID token (a JWT) from Google Identity Services.

    Returns:
        The verified account's email and name.

    Raises:
        InvalidGoogleTokenError: If the token fails any check, or the
            account's email address is not verified.
    """
    try:
        claims = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            config.settings.google_client_id,
        )
    except (ValueError, google_exceptions.GoogleAuthError) as e:
        raise InvalidGoogleTokenError(str(e)) from e
    email = claims.get("email")
    if not email or not claims.get("email_verified"):
        raise InvalidGoogleTokenError("The Google email is not verified.")
    return GoogleProfile(email=email.lower(), name=claims.get("name") or "")
