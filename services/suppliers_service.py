from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.suppliers import Supplier
from schemas.suppliers import SupplierCreate

class SupplierService:
    @staticmethod
    def get_all(db: Session, user_id: int):
        return db.query(Supplier).filter(Supplier.user_id == user_id).all()

    @staticmethod
    def get_one(db: Session, supplier_id: int, user_id: int):
        supplier = db.query(Supplier).filter(
            Supplier.id == supplier_id, 
            Supplier.user_id == user_id
        ).first()
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Supplier not found or unauthorized"
            )
        return supplier

    @staticmethod
    def create(db: Session, supplier_data: SupplierCreate, user_id: int):
        db_supplier = Supplier(
            **supplier_data.model_dump(), 
            user_id=user_id
        )
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        return db_supplier

    @staticmethod
    def update(db: Session, supplier_id: int, supplier_data: SupplierCreate, user_id: int):
        db_supplier = SupplierService.get_one(db, supplier_id, user_id)
        
        # Update fields dynamically
        update_data = supplier_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_supplier, key, value)
            
        db.commit()
        db.refresh(db_supplier)
        return db_supplier

    @staticmethod
    def delete(db: Session, supplier_id: int, user_id: int):
        db_supplier = SupplierService.get_one(db, supplier_id, user_id)
        db.delete(db_supplier)
        db.commit()
        return {"message": "Supplier deleted successfully"}