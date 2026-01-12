"""
Authentication Router
--------------------
Handles user registration, login, and identity verification.
Uses OAuth2 Password Flow for secure token-based authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from fastapi.security import OAuth2PasswordRequestForm
from schemas.user import UserCreate, UserLogin, Token
from services.auth_service import create_user, authenticate_user
from core.security import create_access_token, get_current_user 
from models.user import User 

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user.email, user.password)

@router.post("/login", response_model=Token)

def login(
   
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):

    authenticated_user = authenticate_user(db, form_data.username, form_data.password)
    
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": str(authenticated_user.id)})
    
    return {"access_token": token, "token_type": "bearer"}

# --- NEW PROTECTED ROUTE ---
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """
    This route is now secured. Only users with a valid JWT can access it.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "message": "You are successfully authenticated!"
    }