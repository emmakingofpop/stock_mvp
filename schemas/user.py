"""
User Schemas (Pydantic Models)
------------------------------
Handles data validation, serialization, and documentation for the User API.
These classes define the expected structure of JSON requests and responses.
"""

from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=4, max_length=72)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=72)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
