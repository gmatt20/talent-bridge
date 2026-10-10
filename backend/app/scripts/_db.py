"""Opens a database connection for scripts, honoring DB_MODE."""

import psycopg
from psycopg import rows

from app import dataapi
from app import deps
from app.core import config


def connect() -> deps.Connection:
    """Returns a connection to the configured database (psycopg or Data API)."""
    if config.settings.db_mode == "data-api":
        return dataapi.DataApiConnection()
    return psycopg.connect(
        config.settings.database_url, row_factory=rows.dict_row, autocommit=True
    )
