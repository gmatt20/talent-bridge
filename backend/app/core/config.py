import os
from dataclasses import dataclass, field


@dataclass
class Settings:
    database_url: str = os.environ.get("DATABASE_URL", "postgresql:///talent_bridge")
    secret_key: str = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    cors_origins: list[str] = field(
        default_factory=lambda: os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
    )

    # "psycopg" (direct TCP, needs SSH tunnel to private Aurora) or
    # "data-api" (signed HTTPS via RDS Data API, needs only `aws login`).
    db_mode: str = os.environ.get("DB_MODE", "psycopg")
    rds_cluster_arn: str = os.environ.get("RDS_CLUSTER_ARN", "")
    rds_secret_arn: str = os.environ.get("RDS_SECRET_ARN", "")
    rds_database: str = os.environ.get("RDS_DATABASE", "")
    aws_region: str = os.environ.get("AWS_REGION", "us-west-2")


settings = Settings()
