"""Backend settings, read once from the environment at startup."""

import dataclasses
import os


# One attribute per environment variable.
@dataclasses.dataclass
class Settings:  # pylint: disable=too-many-instance-attributes
    """Configuration for the API, with local-development defaults.

    Attributes:
        database_url: Postgres URL used when `db_mode` is "psycopg".
        secret_key: Signs auth tokens. Must be overridden outside development.
        cors_origins: Origins allowed to call the API from a browser.
        db_mode: "psycopg" (direct TCP, needs an SSH tunnel to private Aurora)
            or "data-api" (signed HTTPS via the RDS Data API, needs only
            `aws login`).
        rds_cluster_arn: Aurora cluster ARN, for "data-api" mode.
        rds_secret_arn: Secrets Manager ARN of the DB credentials, for
            "data-api" mode.
        rds_database: Database name, for "data-api" mode.
        aws_region: AWS region for the RDS Data API client.
    """

    database_url: str = os.environ.get(
        "DATABASE_URL", "postgresql:///talent_bridge"
    )
    secret_key: str = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    cors_origins: list[str] = dataclasses.field(
        default_factory=lambda: os.environ.get(
            "CORS_ORIGINS", "http://localhost:5173"
        ).split(",")
    )
    db_mode: str = os.environ.get("DB_MODE", "psycopg")
    rds_cluster_arn: str = os.environ.get("RDS_CLUSTER_ARN", "")
    rds_secret_arn: str = os.environ.get("RDS_SECRET_ARN", "")
    rds_database: str = os.environ.get("RDS_DATABASE", "")
    aws_region: str = os.environ.get("AWS_REGION", "us-west-2")


settings = Settings()
