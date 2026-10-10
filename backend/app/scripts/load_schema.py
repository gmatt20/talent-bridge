"""Load db/schema.sql into Postgres via the active DB_MODE (psycopg or data-api).

Run once per fresh DB: `uv run python -m app.scripts.load_schema`

For DB_MODE=psycopg you'd normally just use `psql -f db/schema.sql`, but the
Data API's ExecuteStatement only accepts one statement per call, so this
splits the file on `;` and runs each statement through the same connection
abstraction the app uses at runtime (app/deps.py#get_db).
"""

from __future__ import annotations

from pathlib import Path

from app.core.config import settings
from app.dataapi import DataApiConnection

SCHEMA_PATH = Path(__file__).resolve().parent.parent.parent / "db" / "schema.sql"


def main() -> None:
    sql = SCHEMA_PATH.read_text()
    statements = [s.strip() for s in sql.split(";") if s.strip()]

    if settings.db_mode == "data-api":
        conn = DataApiConnection()
    else:
        import psycopg
        from psycopg.rows import dict_row

        conn = psycopg.connect(settings.database_url, row_factory=dict_row, autocommit=True)

    for i, stmt in enumerate(statements, 1):
        conn.execute(stmt)
        print(f"[{i}/{len(statements)}] ok: {stmt.splitlines()[0][:60]}")

    print(f"Loaded {len(statements)} statements.")


if __name__ == "__main__":
    main()
