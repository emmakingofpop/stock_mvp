"""
Main Application Entry Point
----------------------------
This module initializes the FastAPI application, sets up the database 
tables, and mounts the various API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from core.database import Base, engine
from routers import auth, suppliers, products

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastAPI Auth")

# Configure CORS
origins = [
    "http://localhost:3000",    
    "http://127.0.0.1:3000",
    "https://client-gilt-eight.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Call include_router for each router
app.include_router(auth.router)
app.include_router(suppliers.router)
app.include_router(products.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI"}