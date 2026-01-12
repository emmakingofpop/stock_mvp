from pydantic import BaseModel, Field
from typing import Optional

# Base properties shared for creating or reading
class ProductBase(BaseModel):
    name: str
    sku: str
    image: Optional[str] = None
    quantity: int = 0
    price: float = 0.0
    status: str = "In Stock" # "In Stock", "Low", "Out"
    supplier_id: int

# Schema for creating a product (received from frontend)
class ProductCreate(ProductBase):
    pass

# Schema for updating a product (all fields optional)
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    image: Optional[str] = None
    quantity: Optional[int] = None
    price: Optional[float] = None
    status: Optional[str] = None
    supplier_id: Optional[int] = None

# Schema for returning a product (sending to frontend)
class ProductOut(ProductBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True