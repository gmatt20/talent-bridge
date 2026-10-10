import json
from pathlib import Path

import pytest

from app.ai.schemas import MentorProfile, Skill, StudentProfile

SEED_PATH = Path(__file__).parent.parent / "app" / "data" / "seed.json"


@pytest.fixture(scope="session")
def seed():
    with SEED_PATH.open() as f:
        return json.load(f)


@pytest.fixture(scope="session")
def catalog(seed):
    return [Skill(**s) for s in seed["skills"]]


@pytest.fixture(scope="session")
def students(seed):
    return [StudentProfile(**s) for s in seed["students"]]


@pytest.fixture(scope="session")
def mentors(seed):
    return [MentorProfile(**m) for m in seed["mentors"]]
