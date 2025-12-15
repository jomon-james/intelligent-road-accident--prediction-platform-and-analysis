from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import pandas as pd
import numpy as np
from config import Config
from .routes import router
import logging
from .database import init_db, get_db
from .data_migration import run_migration
from .admin_routes import router as admin_router

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events"""
    # Startup
    logger.info("Starting up Intelligent Road Accident Analysis Platform...")
    
    # Initialize database
    try:
        init_db()
        logger.info("Database initialized")
        
        # Check if we need to load data (optional - you might want to run migration separately)
        # run_migration()
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
    
    # Load ML model
    try:
        from .ml_model.model_training import AccidentPredictor
        app.state.predictor = AccidentPredictor()
        logger.info("ML model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load ML model: {e}")
        app.state.predictor = None
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    if app.state.predictor:
        app.state.predictor.cleanup()

# Create FastAPI app
app = FastAPI(
    title="Intelligent Road Accident Analysis Platform",
    description="API for road accident analysis and severity prediction",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router, prefix="/api")
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Intelligent Road Accident Analysis Platform API",
        "version": "1.0.0",
        "database": "SQLite",
        "endpoints": {
            "health": "/api/health",
            "predict": "/api/predict",
            "data_stats": "/api/data/stats",
            "hotspots": "/api/data/hotspots",
            "features": "/api/data/features",
            "database": "/api/db/stats",
            "migrate": "/api/db/migrate"  # Optional endpoint to trigger migration
        }
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": app.state.predictor is not None,
        "database": "initialized",
        "service": "Intelligent Road Accident Analysis Platform"
    }