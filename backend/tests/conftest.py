"""Shared pytest fixtures: the seed data as AI-module objects."""

# Pytest injects fixtures by parameter name, which shadows the fixture
# functions by design.
# pylint: disable=redefined-outer-name

import json
import pathlib

import pytest

from app.ai import schemas

SEED_PATH = pathlib.Path(__file__).parent.parent / "app" / "data" / "seed.json"


@pytest.fixture(scope="session")
def seed():
    """The parsed app/data/seed.json."""
    with SEED_PATH.open() as f:
        return json.load(f)


@pytest.fixture(scope="session")
def catalog(seed):
    """The seed skill catalog."""
    return [schemas.Skill(**s) for s in seed["skills"]]


@pytest.fixture(scope="session")
def students(seed):
    """The seed students."""
    return [schemas.StudentProfile(**s) for s in seed["students"]]


@pytest.fixture(scope="session")
def mentors(seed):
    """The seed mentors."""
    return [schemas.MentorProfile(**m) for m in seed["mentors"]]
