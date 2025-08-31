from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import os
from dotenv import load_dotenv
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database URL configuration
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    # Render provides postgres:// but SQLAlchemy expects postgresql://
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Fallback to SQLite for local development
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./expense_tracker.db"
    logger.info("Using SQLite database for local development")

# Create engine
try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            DATABASE_URL, 
            connect_args={"check_same_thread": False}
        )
        logger.info("SQLite engine created successfully")
    else:
        engine = create_engine(DATABASE_URL)
        logger.info("PostgreSQL engine created successfully")
        
    # Test connection (optional - won't block startup)
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("Database connection test successful")
    except Exception as e:
        logger.warning(f"Database connection test failed (this is okay during startup): {e}")
        
except SQLAlchemyError as e:
    logger.error(f"Database engine creation failed: {e}")
    raise Exception(f"Failed to create database engine: {e}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
