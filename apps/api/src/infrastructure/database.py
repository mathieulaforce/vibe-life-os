from dataclasses import dataclass
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


@dataclass(frozen=True)
class DatabaseConfig:
    host: str
    port: int
    database: str
    user: str
    password: str

    @staticmethod
    def from_env() -> "DatabaseConfig":
        return DatabaseConfig(
            host=os.getenv("MARIADB_HOST", "localhost"),
            port=int(os.getenv("MARIADB_PORT", "3306")),
            database=os.getenv("MARIADB_DATABASE", "lifeos"),
            user=os.getenv("MARIADB_USER", "lifeos"),
            password=os.getenv("MARIADB_PASSWORD", "lifeos_dev"),
        )


Base = declarative_base()


def build_engine() -> tuple[sessionmaker, str, object]:
    url = os.getenv("DATABASE_URL")
    if not url:
        config = DatabaseConfig.from_env()
        url = (
            f"mysql+pymysql://{config.user}:{config.password}"
            f"@{config.host}:{config.port}/{config.database}"
        )
    engine = create_engine(url, pool_pre_ping=True)
    return sessionmaker(bind=engine, autoflush=False, autocommit=False), url, engine


SessionLocal, DATABASE_URL, ENGINE = build_engine()
