from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

# SQLAlchemy requires the postgresql+psycopg:// dialect prefix for psycopg v3.
# Supabase connection strings use postgresql:// or postgres:// — translate here.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# When using Supabase's PgBouncer pooler (transaction mode), prepared statements
# are not supported. Disabling them here prevents StatementError at query time.
connect_args = {}
if "pooler.supabase.com" in DATABASE_URL:
    connect_args["options"] = "-c statement_timeout=30000"
    connect_args["prepare_threshold"] = None  # disable prepared statements for pgbouncer

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,          # test connections before use
    pool_recycle=300,            # recycle connections every 5 minutes
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
