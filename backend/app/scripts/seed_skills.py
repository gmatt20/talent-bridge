"""Load the skills catalog from app/data/seed.json into Postgres.

Run once per fresh DB: `uv run python -m app.scripts.seed_skills`
"""

from __future__ import annotations

import json
from pathlib import Path

from app.core.config import settings
from app.dataapi import DataApiConnection

SEED_PATH = Path(__file__).resolve().parent.parent / "data" / "seed.json"


def _connect():
    if settings.db_mode == "data-api":
        return DataApiConnection()
    import psycopg
    from psycopg.rows import dict_row

    return psycopg.connect(settings.database_url, row_factory=dict_row, autocommit=True)


def main() -> None:
    data = json.loads(SEED_PATH.read_text())
    conn = _connect()
    for skill in data["skills"]:
        conn.execute(
            "INSERT INTO skills (id, name) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING",
            (skill["id"], skill["name"]),
        )
    conn.execute("SELECT setval(pg_get_serial_sequence('skills', 'id'), (SELECT max(id) FROM skills))")
    print(f"Seeded {len(data['skills'])} skills.")


if __name__ == "__main__":
    main()
