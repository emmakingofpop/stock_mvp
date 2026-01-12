"""
Database Configuration
----------------------
This module handles the SQLAlchemy connection to the PostgreSQL database.
It sets up the engine, session factory, and the base class for models.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv  # <--- Add this

# Load the variables from the .env file
load_dotenv() 

DATABASE_URL = os.getenv("DATABASE_URL")

# Safety check: Prevent the "got None" error from crashing the engine later
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set. Check your .env file!")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()