"""
Authentication Service
----------------------
Contains the business logic for user management and authentication.
Separates the database operations from the API route definitions.
"""

from sqlalchemy.orm import Session
from models.user import User
from utils.hash import hash_password, verify_password

def create_user(db: Session, email: str, password: str):
    user = User(email=email, password=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password):
        return None
    return user
