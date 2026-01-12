"""
User Database Model
-------------------
Defines the SQLAlchemy schema for the 'users' table in PostgreSQL.
"""

from sqlalchemy import Column, Integer, String
from core.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    suppliers = relationship("Supplier", back_populates="owner")
    products = relationship(
        "Product",
        back_populates="owner",
        cascade="all, delete"
    )