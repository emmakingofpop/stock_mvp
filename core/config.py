"""
Authentication Configuration
---------------------------
This module handles environment variables and constants required for 
JWT (JSON Web Token) generation and validation.
"""

import os

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
