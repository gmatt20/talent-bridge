"""RDS Data API shim that mimics just enough of psycopg's Connection API.

It supports `execute(sql, params).fetchone()/.fetchall()` and
`.transaction()`, so `repo.py` and every router work unchanged whether the
backend talks to Postgres over a direct TCP connection (psycopg, via an SSH
tunnel) or over signed HTTPS calls (this, via `aws login` / IAM, with no VPC
network path needed).

Toggle with `DB_MODE=data-api` in `.env`; see `deps.get_db`.
"""

from __future__ import annotations

import functools
import json
import re
from typing import Any

import boto3
from psycopg.types import json as psycopg_json

from app.core import config

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_JSON_COLUMNS = frozenset({"objectives", "deliverables"})


@functools.cache
def _get_client() -> Any:
    return boto3.client("rds-data", region_name=config.settings.aws_region)


# One return per supported parameter type.
def _to_param(  # pylint: disable=too-many-return-statements
    name: str, value: Any
) -> dict[str, Any]:
    """Converts a Python value to a Data API named parameter."""
    if value is None:
        return {"name": name, "value": {"isNull": True}}
    if isinstance(value, psycopg_json.Json):
        return {
            "name": name,
            "value": {"stringValue": json.dumps(value.obj)},
            "typeHint": "JSON",
        }
    if isinstance(value, bool):
        return {"name": name, "value": {"booleanValue": value}}
    if isinstance(value, int):
        return {"name": name, "value": {"longValue": value}}
    if isinstance(value, float):
        return {"name": name, "value": {"doubleValue": value}}
    if isinstance(value, str) and _DATE_RE.match(value):
        return {
            "name": name,
            "value": {"stringValue": value},
            "typeHint": "DATE",
        }
    return {"name": name, "value": {"stringValue": str(value)}}


def _convert_sql(
    sql: str, params: tuple | list | None
) -> tuple[str, list[dict[str, Any]]]:
    """Rewrites `%s` placeholders as `:p0, :p1, ...` with matching params."""
    if not params:
        return sql, []
    parts = sql.split("%s")
    if len(parts) != len(params) + 1:
        raise ValueError(
            f"placeholder/param count mismatch: {sql!r} vs {params!r}"
        )
    names = [f"p{i}" for i in range(len(params))]
    pieces = [parts[0]]
    for name, part in zip(names, parts[1:]):
        pieces.append(f":{name}{part}")
    params_out = [_to_param(name, v) for name, v in zip(names, params)]
    return "".join(pieces), params_out


def _coerce_json_columns(record: dict[str, Any]) -> dict[str, Any]:
    """Parses JSON columns, which the Data API returns as strings."""
    for column in _JSON_COLUMNS:
        if isinstance(record.get(column), str):
            try:
                record[column] = json.loads(record[column])
            except ValueError:
                pass  # Not JSON after all; keep the raw string.
    return record


class _Cursor:
    """The result of one statement, with psycopg's fetch methods."""

    def __init__(self, records: list[dict[str, Any]]):
        self._records = [_coerce_json_columns(r) for r in records]

    def fetchone(self) -> dict[str, Any] | None:
        """Returns the first row, or None if there are no rows."""
        return self._records[0] if self._records else None

    def fetchall(self) -> list[dict[str, Any]]:
        """Returns every row."""
        return self._records


class DataApiConnection:
    """A database connection that runs statements through the RDS Data API.

    Attributes:
        resource_arn: The Aurora cluster ARN.
        secret_arn: The Secrets Manager ARN of the database credentials.
        database: The database name.
    """

    def __init__(self) -> None:
        self.resource_arn = config.settings.rds_cluster_arn
        self.secret_arn = config.settings.rds_secret_arn
        self.database = config.settings.rds_database
        self.transaction_id: str | None = None

    def execute(self, sql: str, params: tuple | list | None = None) -> _Cursor:
        """Runs one statement, inside the open transaction if there is one."""
        new_sql, sql_params = _convert_sql(sql, params)
        kwargs: dict[str, Any] = {
            "resourceArn": self.resource_arn,
            "secretArn": self.secret_arn,
            "database": self.database,
            "sql": new_sql,
            "formatRecordsAs": "JSON",
        }
        if sql_params:
            kwargs["parameters"] = sql_params
        if self.transaction_id:
            kwargs["transactionId"] = self.transaction_id
        resp = _get_client().execute_statement(**kwargs)
        formatted = resp.get("formattedRecords")
        records = json.loads(formatted) if formatted else []
        return _Cursor(records)

    def transaction(self) -> _DataApiTransaction:
        """Returns a context manager that commits, or rolls back on error."""
        return _DataApiTransaction(self)

    def close(self) -> None:
        """Does nothing; the Data API has no connection to close."""


class _DataApiTransaction:
    """Context manager for one Data API transaction."""

    def __init__(self, conn: DataApiConnection) -> None:
        self.conn = conn

    def __enter__(self) -> _DataApiTransaction:
        resp = _get_client().begin_transaction(
            resourceArn=self.conn.resource_arn,
            secretArn=self.conn.secret_arn,
            database=self.conn.database,
        )
        self.conn.transaction_id = resp["transactionId"]
        return self

    def __exit__(self, exc_type, exc, tb) -> bool:
        del exc, tb  # Unused; only whether an exception happened matters.
        end = (
            _get_client().commit_transaction
            if exc_type is None
            else _get_client().rollback_transaction
        )
        end(
            resourceArn=self.conn.resource_arn,
            secretArn=self.conn.secret_arn,
            transactionId=self.conn.transaction_id,
        )
        self.conn.transaction_id = None
        return False
