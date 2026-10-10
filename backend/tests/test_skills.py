from app.ai.schemas import Skill
from app.ai.skills import resolve_skills


def test_exact_match(catalog):
    out = resolve_skills(["React", "Python"], catalog)
    assert [s.name for s in out] == ["React", "Python"]


def test_fuzzy_match(catalog):
    out = resolve_skills(["reactjs", "tailwind"], catalog)
    names = [s.name for s in out]
    assert "React" in names
    assert "Tailwind CSS" in names


def test_dedupes(catalog):
    out = resolve_skills(["React", "react", "REACT"], catalog)
    assert [s.name for s in out] == ["React"]


def test_drops_unknown(catalog):
    out = resolve_skills(["Quantum Blockchain Yodeling"], catalog)
    assert out == []


def test_empty_inputs():
    assert resolve_skills([], [Skill(id=1, name="Python")]) == []
    assert resolve_skills(["Python"], []) == []
