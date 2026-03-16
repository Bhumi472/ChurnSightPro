import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Fix Railway PostgreSQL URL (Railway gives postgres:// but SQLAlchemy needs postgresql://)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

is_sqlite = db_url.startswith("sqlite")

engine = create_engine(
    db_url,
    connect_args={"check_same_thread": False} if is_sqlite else {},
    pool_pre_ping=True,
    pool_size=5 if not is_sqlite else 1,
    max_overflow=10 if not is_sqlite else 0,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app.models import prediction  # noqa
    if is_sqlite:
        os.makedirs("database", exist_ok=True)
    Base.metadata.create_all(bind=engine)