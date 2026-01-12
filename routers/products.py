from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from schemas.products import ProductOut, ProductCreate, ProductUpdate
from core.database import get_db
from services.products_service import ProductService
from core.security import get_current_user 
from models.user import User 

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

@router.get("/", response_model=List[ProductOut])
def read_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch all products belonging only to the authenticated user."""
    return ProductService.get_all(db, user_id=current_user.id)

@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new product linked to the authenticated user and a valid supplier."""
    return ProductService.create(db, product, user_id=current_user.id)

@router.get("/{product_id}", response_model=ProductOut)
def read_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific product owned by the user."""
    return ProductService.get_one(db, product_id, user_id=current_user.id)

@router.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int, 
    product: ProductUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update specific fields of a product owned by the authenticated user."""
    return ProductService.update(db, product_id, product, user_id=current_user.id)

@router.delete("/{product_id}")
def delete_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a product owned by the authenticated user."""
    return ProductService.delete(db, product_id, user_id=current_user.id)