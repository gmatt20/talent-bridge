"""Loads db/schema.sql into Postgres via the active DB_MODE.

Run once per fresh database: `uv run python -m app.scripts.load_schema`

For DB_MODE=psycopg you'd normally just use `psql -f db/schema.sql`, but the
Data API's ExecuteStatement only accepts one statement per call, so this
splits the file on `;` and runs each statement through the same connection
abstraction the app uses at runtime (`app.deps.get_db`).
"""

import pathlib

from app.scripts import _db

SCHEMA_PATH = (
    pathlib.Path(__file__).resolve().parent.parent.parent / "db" / "schema.sql"
)


def main() -> None:
    """Runs every statement in the schema file, printing progress."""
    sql = SCHEMA_PATH.read_text()
    statements = [s.strip() for s in sql.split(";") if s.strip()]
    conn = _db.connect()
    for i, statement in enumerate(statements, 1):
        conn.execute(statement)
        first_line = statement.splitlines()[0][:60]
        print(f"[{i}/{len(statements)}] ok: {first_line}")
    print(f"Loaded {len(statements)} statements.")


if __name__ == "__main__":
    main()
