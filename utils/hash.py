"""
Password Hashing Utilities
--------------------------
Handles secure password hashing and verification using the bcrypt algorithm.
Includes a fix for the 72-byte limit inherent to bcrypt.
"""
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    safe_password = password.encode('utf-8')[:72]
    return pwd_context.hash(safe_password)

def verify_password(plain_password: str, hashed_password: str)-> bool:
    safe_password = plain_password.encode('utf-8')[:72]
    return pwd_context.verify(safe_password, hashed_password)