"""Tests for app.core.google_identity."""

from unittest import mock

import pytest

from app.core import config
from app.core import google_identity

_VERIFY = "google.oauth2.id_token.verify_oauth2_token"


def test_returns_lowercased_email_and_name():
    claims = {"email": "Ana@UCI.edu", "email_verified": True, "name": "Ana"}
    with (
        mock.patch.object(config.settings, "google_client_id", "client-id"),
        mock.patch(_VERIFY, return_value=claims) as verify,
    ):
        profile = google_identity.verify_id_token("token")

    assert profile == google_identity.GoogleProfile("ana@uci.edu", "Ana")
    # The token must be checked against this app's client ID.
    assert verify.call_args.args[0] == "token"
    assert verify.call_args.args[2] == "client-id"


def test_missing_name_becomes_empty():
    claims = {"email": "ana@uci.edu", "email_verified": True}
    with mock.patch(_VERIFY, return_value=claims):
        assert google_identity.verify_id_token("token").name == ""


def test_rejects_unverified_email():
    claims = {"email": "ana@uci.edu", "email_verified": False}
    with mock.patch(_VERIFY, return_value=claims):
        with pytest.raises(google_identity.InvalidGoogleTokenError):
            google_identity.verify_id_token("token")


def test_rejects_token_that_fails_verification():
    with mock.patch(_VERIFY, side_effect=ValueError("Token expired")):
        with pytest.raises(google_identity.InvalidGoogleTokenError):
            google_identity.verify_id_token("token")
