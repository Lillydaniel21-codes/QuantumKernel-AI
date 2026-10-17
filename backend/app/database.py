from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    from app.models import user, experiment  # noqa
    Base.metadata.create_all(bind=engine)

# Auto-initialize tables
init_db()

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
