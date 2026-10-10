"""Tests for app.ai.skills."""

from app.ai import schemas
from app.ai import skills


def test_exact_match(catalog):
    out = skills.resolve_skills(["React", "Python"], catalog)
    assert [s.name for s in out] == ["React", "Python"]


def test_fuzzy_match(catalog):
    out = skills.resolve_skills(["reactjs", "tailwind"], catalog)
    names = [s.name for s in out]
    assert "React" in names
    assert "Tailwind CSS" in names


def test_dedupes(catalog):
    out = skills.resolve_skills(["React", "react", "REACT"], catalog)
    assert [s.name for s in out] == ["React"]


def test_drops_unknown(catalog):
    assert not skills.resolve_skills(["Quantum Blockchain Yodeling"], catalog)


def test_empty_inputs():
    assert not skills.resolve_skills([], [schemas.Skill(id=1, name="Python")])
    assert not skills.resolve_skills(["Python"], [])
