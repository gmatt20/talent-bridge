"""RDS Data API shim — mimics just enough of psycopg3's Connection API
(`execute(sql, params).fetchone()/.fetchall()`, `.transaction()`) that
`repo.py` and every router work unchanged whether the backend talks to
Postgres over a direct TCP connection (psycopg, via SSH tunnel) or over
signed HTTPS calls (this, via `aws login` / IAM — no VPC network path
needed at all).

Toggle with `DB_MODE=data-api` in `.env`; see `deps.py#get_db`.
"""

from __future__ import annotations

import json
import re
from typing import Any

import boto3
from psycopg.types.json import Json

from .core.config import settings

_client = None

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_JSON_COLUMNS = {"objectives", "deliverables"}


def _get_client():
    global _client
    if _client is None:
        _client = boto3.client("rds-data", region_name=settings.aws_region)
    return _client


def _to_param(name: str, value: Any) -> dict:
    if value is None:
        return {"name": name, "value": {"isNull": True}}
    if isinstance(value, Json):
        return {"name": name, "value": {"stringValue": json.dumps(value.obj)}, "typeHint": "JSON"}
    if isinstance(value, bool):
        return {"name": name, "value": {"booleanValue": value}}
    if isinstance(value, int):
        return {"name": name, "value": {"longValue": value}}
    if isinstance(value, float):
        return {"name": name, "value": {"doubleValue": value}}
    if isinstance(value, str) and _DATE_RE.match(value):
        return {"name": name, "value": {"stringValue": value}, "typeHint": "DATE"}
    return {"name": name, "value": {"stringValue": str(value)}}


def _convert_sql(sql: str, params: tuple | list | None) -> tuple[str, list[dict]]:
    if not params:
        return sql, []
    parts = sql.split("%s")
    if len(parts) != len(params) + 1:
        raise ValueError(f"placeholder/param count mismatch: {sql!r} vs {params!r}")
    names = [f"p{i}" for i in range(len(params))]
    new_sql = parts[0]
    for name, part in zip(names, parts[1:]):
        new_sql += f":{name}" + part
    return new_sql, [_to_param(n, v) for n, v in zip(names, params)]


def _coerce_json_columns(record: dict) -> dict:
    for col in _JSON_COLUMNS:
        if isinstance(record.get(col), str):
            try:
                record[col] = json.loads(record[col])
            except ValueError:
                pass
    return record


class _Cursor:
    def __init__(self, records: list[dict]):
        self._records = [_coerce_json_columns(r) for r in records]

    def fetchone(self) -> dict | None:
        return self._records[0] if self._records else None

    def fetchall(self) -> list[dict]:
        return self._records


class DataApiConnection:
    def __init__(self) -> None:
        self.resource_arn = settings.rds_cluster_arn
        self.secret_arn = settings.rds_secret_arn
        self.database = settings.rds_database
        self._transaction_id: str | None = None

    def execute(self, sql: str, params: tuple | list | None = None) -> _Cursor:
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
        if self._transaction_id:
            kwargs["transactionId"] = self._transaction_id
        resp = _get_client().execute_statement(**kwargs)
        formatted = resp.get("formattedRecords")
        records = json.loads(formatted) if formatted else []
        return _Cursor(records)

    def transaction(self) -> _DataApiTransaction:
        return _DataApiTransaction(self)

    def close(self) -> None:
        pass


class _DataApiTransaction:
    def __init__(self, conn: DataApiConnection) -> None:
        self.conn = conn

    def __enter__(self) -> _DataApiTransaction:
        resp = _get_client().begin_transaction(
            resourceArn=self.conn.resource_arn,
            secretArn=self.conn.secret_arn,
            database=self.conn.database,
        )
        self.conn._transaction_id = resp["transactionId"]
        return self

    def __exit__(self, exc_type, exc, tb) -> bool:
        client = _get_client()
        if exc_type is None:
            client.commit_transaction(
                resourceArn=self.conn.resource_arn,
                secretArn=self.conn.secret_arn,
                transactionId=self.conn._transaction_id,
            )
        else:
            client.rollback_transaction(
                resourceArn=self.conn.resource_arn,
                secretArn=self.conn.secret_arn,
                transactionId=self.conn._transaction_id,
            )
        self.conn._transaction_id = None
        return False
