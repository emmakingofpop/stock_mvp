from pydantic import BaseModel, EmailStr
from typing import Optional

# Base properties shared for creating or reading
class SupplierBase(BaseModel):
    name: str
    contact_person: str
    email: EmailStr
    phone: str
    category: str
    linked_products_count: int = 0
    address: str

# Schema for creating a supplier (received from frontend)
class SupplierCreate(BaseModel):
    name: str
    contact_person: str
    email: EmailStr
    phone: str
    category: str
    linked_products_count: int = 0
    address: str

# Schema for returning a supplier (sending to frontend)
class SupplierOut(SupplierBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True