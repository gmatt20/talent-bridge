"""Loads the skills catalog from app/data/seed.json into Postgres.

Run once per fresh database: `uv run python -m app.scripts.seed_skills`
"""

import json
import pathlib

from app.scripts import _db

SEED_PATH = (
    pathlib.Path(__file__).resolve().parent.parent / "data" / "seed.json"
)


def main() -> None:
    """Inserts the seed skills and moves the id sequence past the highest."""
    data = json.loads(SEED_PATH.read_text())
    conn = _db.connect()
    for skill in data["skills"]:
        conn.execute(
            "INSERT INTO skills (id, name) VALUES (%s, %s) "
            "ON CONFLICT (id) DO NOTHING",
            (skill["id"], skill["name"]),
        )
    conn.execute(
        "SELECT setval(pg_get_serial_sequence('skills', 'id'), "
        "(SELECT max(id) FROM skills))"
    )
    print(f"Seeded {len(data['skills'])} skills.")


if __name__ == "__main__":
    main()
