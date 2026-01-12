from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from schemas.suppliers import SupplierOut, SupplierCreate
from core.database import get_db
from services.suppliers_service import SupplierService
# Assuming your auth logic and User model are in these locations:
from core.security import get_current_user 
from models.user import User 

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"]
)

@router.get("/", response_model=List[SupplierOut])
def read_suppliers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch all suppliers belonging only to the authenticated user."""
    return SupplierService.get_all(db, user_id=current_user.id)

@router.post("/", response_model=SupplierOut, status_code=status.HTTP_201_CREATED)
def create_supplier(
    supplier: SupplierCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new supplier profile linked to the authenticated user."""
    return SupplierService.create(db, supplier, user_id=current_user.id)

@router.get("/{supplier_id}", response_model=SupplierOut)
def read_supplier(
    supplier_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific supplier owned by the user."""
    return SupplierService.get_one(db, supplier_id, user_id=current_user.id)

@router.put("/{supplier_id}", response_model=SupplierOut)
def update_supplier(
    supplier_id: int, 
    supplier: SupplierCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a supplier owned by the authenticated user."""
    return SupplierService.update(db, supplier_id, supplier, user_id=current_user.id)

@router.delete("/{supplier_id}")
def delete_supplier(
    supplier_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a supplier owned by the authenticated user."""
    return SupplierService.delete(db, supplier_id, user_id=current_user.id)