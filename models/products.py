from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from core.database import Base 

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, index=True, nullable=False)
    image = Column(String, nullable=True) # Stores the image path or URL
    quantity = Column(Integer, default=0)
    price = Column(Float, default=0.0)
    status = Column(String, default="In Stock") # "In Stock", "Low", "Out"
    
    # Foreign Keys
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    supplier = relationship("Supplier", back_populates="products")
    owner = relationship("User", back_populates="products")
