"""Tests for Google sign-in: token verification and `POST /api/auth/google`."""

# Pytest fixtures shadow outer names by design.
# pylint: disable=redefined-outer-name

import contextlib
from unittest import mock

import fastapi
import pytest

from app import schemas
from app.core import config
from app.core import google_identity
from app.core import security
from app.routers import auth

ANA = google_identity.GoogleProfile(email="ana@uci.edu", name="Ana Reyes")


class _Cursor:

    def __init__(self, row):
        self._row = row

    def fetchone(self):
        """Returns the statement's only row, if any."""
        return self._row


class FakeDb:
    """An in-memory stand-in for the few statements sign-in runs."""

    def __init__(self):
        self.users = []
        self.profiles = []

    def transaction(self):
        """Returns a no-op transaction."""
        return contextlib.nullcontext()

    def execute(self, sql, params=()):
        """Runs one of the statements the auth router issues."""
        if sql.startswith("SELECT id, role"):
            return _Cursor(self._find("email", params[0]))
        if sql.startswith("SELECT 1 FROM users WHERE LOWER(name)"):
            return _Cursor(self._find("name", params[0]))
        if sql.startswith("INSERT INTO users"):
            role, email, password_hash, name = params
            user = {
                "id": len(self.users) + 1,
                "role": role,
                "email": email,
                "password_hash": password_hash,
                "name": name,
                "created_at": None,
            }
            self.users.append(user)
            return _Cursor(user)
        if sql.startswith("INSERT INTO"):
            self.profiles.append(sql.split()[2])
            return _Cursor(None)
        raise AssertionError(f"unexpected SQL: {sql}")

    def _find(self, column, value):
        for user in self.users:
            if user[column].lower() == value.lower():
                return user
        return None


@pytest.fixture
def db():
    """An empty fake database."""
    return FakeDb()


@pytest.fixture(autouse=True)
def google_configured():
    """Configures a client ID and makes every token verify as Ana's."""
    with (
        mock.patch.object(config.settings, "google_client_id", "client-id"),
        mock.patch(
            "app.core.google_identity.verify_id_token", return_value=ANA
        ),
    ):
        yield


def _sign_in(db, **fields):
    body = schemas.GoogleSignInRequest(credential="token", **fields)
    return auth.google_sign_in(body, db)


def test_first_sign_in_creates_account_and_profile(db):
    res = _sign_in(db, role="student")

    assert res["isNewUser"] is True
    assert res["user"]["email"] == "ana@uci.edu"
    assert res["user"]["name"] == "Ana Reyes"
    assert res["user"]["role"] == "student"
    assert security.verify_token(res["token"]) == res["user"]["id"]
    assert db.profiles == ["student_profiles"]


def test_typed_name_overrides_google_name(db):
    res = _sign_in(db, role="organization", name="  Habitat OC  ")

    assert res["user"]["name"] == "Habitat OC"
    assert db.profiles == ["organizations"]


def test_existing_account_signs_in_and_keeps_its_role(db):
    first = _sign_in(db, role="student")

    again = _sign_in(db, role="organization")

    assert again["isNewUser"] is False
    assert again["user"] == first["user"]
    assert len(db.users) == 1


def test_google_account_has_no_usable_password(db):
    _sign_in(db, role="student")

    stored = db.users[0]["password_hash"]
    assert not security.verify_password("", stored)
    assert not security.verify_password(stored, stored)


def test_unknown_account_without_role_is_sent_to_sign_up(db):
    with pytest.raises(fastapi.HTTPException) as exc:
        _sign_in(db)

    assert exc.value.status_code == 404
    assert not db.users


def test_rejects_unknown_role(db):
    with pytest.raises(fastapi.HTTPException) as exc:
        _sign_in(db, role="admin")

    assert exc.value.status_code == 400
    assert not db.users


def test_rejects_taken_name(db):
    db.users.append(
        {
            "id": 1,
            "role": "student",
            "email": "other@uci.edu",
            "password_hash": "x",
            "name": "ana reyes",
            "created_at": None,
        }
    )

    with pytest.raises(fastapi.HTTPException) as exc:
        _sign_in(db, role="student")

    assert exc.value.status_code == 409


def test_invalid_token_is_unauthorized(db):
    error = google_identity.InvalidGoogleTokenError("bad signature")
    with mock.patch(
        "app.core.google_identity.verify_id_token", side_effect=error
    ):
        with pytest.raises(fastapi.HTTPException) as exc:
            _sign_in(db, role="student")

    assert exc.value.status_code == 401
    assert not db.users


def test_unconfigured_client_id_disables_sign_in(db):
    with mock.patch.object(config.settings, "google_client_id", ""):
        with pytest.raises(fastapi.HTTPException) as exc:
            _sign_in(db, role="student")

    assert exc.value.status_code == 503
