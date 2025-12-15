import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    # Server configuration
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", 8000))
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    
    # CORS configuration
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]
    
    # Database configuration
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./accidents.db")
    
    # ML Model paths
    MODEL_PATH = "app/ml_model/model.pkl"
    PREPROCESSOR_PATH = "app/ml_model/preprocessing_pipeline.pkl"
    FEATURES_PATH = "app/ml_model/feature_names.json"
    
    # Data paths
    DATA_PATH = "app/data/AccidentsBig_processed.csv"
    
    # Prediction settings
    SEVERITY_MAP = {
        0: "Slight",
        1: "Serious",
        2: "Fatal"
    }
    
    CONFIDENCE_THRESHOLD = 0.6
    
    # JWT Authentication
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # Admin credentials (in production, use environment variables)
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@accidentplatform.com")