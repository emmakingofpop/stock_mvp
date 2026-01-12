from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.products import Product
from models.suppliers import Supplier
from schemas.products import ProductCreate, ProductUpdate

class ProductService:
    @staticmethod
    def get_all(db: Session, user_id: int):
        return db.query(Product).filter(Product.user_id == user_id).all()

    @staticmethod
    def get_one(db: Session, product_id: int, user_id: int):
        product = db.query(Product).filter(
            Product.id == product_id, 
            Product.user_id == user_id
        ).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Product not found or unauthorized"
            )
        return product

    @staticmethod
    def create(db: Session, product_data: ProductCreate, user_id: int):
        # Verify supplier belongs to user before linking
        supplier = db.query(Supplier).filter(
            Supplier.id == product_data.supplier_id, 
            Supplier.user_id == user_id
        ).first()
        
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid supplier_id: Supplier does not exist or unauthorized"
            )

        db_product = Product(
            **product_data.model_dump(), 
            user_id=user_id
        )
        db.add(db_product)
        
        # Increment the linked_products_count on the supplier
        supplier.linked_products_count += 1
        
        db.commit()
        db.refresh(db_product)
        return db_product

    @staticmethod
    def update(db: Session, product_id: int, product_data: ProductUpdate, user_id: int):
        db_product = ProductService.get_one(db, product_id, user_id)
        
        update_data = product_data.model_dump(exclude_unset=True)
        
        # If supplier_id is being changed, verify the new one
        if "supplier_id" in update_data:
            new_supplier = db.query(Supplier).filter(
                Supplier.id == update_data["supplier_id"], 
                Supplier.user_id == user_id
            ).first()
            if not new_supplier:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid supplier_id: Supplier unauthorized"
                )

        # Update fields dynamically
        for key, value in update_data.items():
            setattr(db_product, key, value)
            
        db.commit()
        db.refresh(db_product)
        return db_product

    @staticmethod
    def delete(db: Session, product_id: int, user_id: int):
        db_product = ProductService.get_one(db, product_id, user_id)
        
        # Decrement the count on the associated supplier if it exists
        supplier = db.query(Supplier).filter(Supplier.id == db_product.supplier_id).first()
        if supplier and supplier.linked_products_count > 0:
            supplier.linked_products_count -= 1
            
        db.delete(db_product)
        db.commit()
        return {"message": "Product deleted successfully"}