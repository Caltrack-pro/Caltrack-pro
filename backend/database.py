from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# When using Supabase's PgBouncer pooler (transaction mode), prepared statements
# are not supported. Disabling them here prevents StatementError at query time.
connect_args = {}
if DATABASE_URL and "pooler.supabase.com" in DATABASE_URL:
    connect_args["options"] = "-c statement_timeout=30000"

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
