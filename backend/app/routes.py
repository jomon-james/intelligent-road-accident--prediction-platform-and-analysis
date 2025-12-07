from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import pandas as pd
import json
import logging
from datetime import datetime
from .ml_model.model_training import AccidentPredictor

router = APIRouter()
logger = logging.getLogger(__name__)

# Pydantic models for request/response
class PredictionRequest(BaseModel):
    """Request model for accident severity prediction"""
    accident_date: str = Field(..., description="Date of accident (YYYY-MM-DD)")
    accident_time: str = Field(..., description="Time of accident (HH:MM)")
    longitude: float = Field(..., description="Longitude coordinate", ge=-180, le=180)
    latitude: float = Field(..., description="Latitude coordinate", ge=-90, le=90)
    weather_conditions: str = Field(..., description="Weather conditions")
    light_conditions: str = Field(..., description="Light conditions")
    road_type: str = Field(..., description="Type of road")
    speed_limit: int = Field(..., description="Speed limit in km/h", ge=0, le=200)
    road_surface_conditions: str = Field(..., description="Road surface conditions")
    junction_detail: str = Field(..., description="Junction details")
    urban_or_rural_area: str = Field(..., description="Urban or rural area")
    
    class Config:
        schema_extra = {
            "example": {
                "accident_date": "2023-01-15",
                "accident_time": "14:30",
                "longitude": -0.1278,
                "latitude": 51.5074,
                "weather_conditions": "Fine no high winds",
                "light_conditions": "Daylight",
                "road_type": "Single carriageway",
                "speed_limit": 60,
                "road_surface_conditions": "Dry",
                "junction_detail": "Not at junction or within 20 metres",
                "urban_or_rural_area": "Urban"
            }
        }

class PredictionResponse(BaseModel):
    """Response model for prediction"""
    severity: str
    severity_code: int
    confidence: float
    needs_manual_review: bool
    factors: Dict[str, Any]
    timestamp: str

class HotspotRequest(BaseModel):
    """Request model for hotspot analysis"""
    min_date: Optional[str] = None
    max_date: Optional[str] = None
    severity_filter: Optional[List[str]] = None
    limit: int = 100

@router.post("/predict", response_model=PredictionResponse)
async def predict_severity(request: PredictionRequest):
    """Predict accident severity based on input parameters"""
    try:
        from main import app
        
        if not app.state.predictor:
            raise HTTPException(status_code=503, detail="ML model not loaded")
        
        # Convert request to dict
        input_data = request.dict()
        
        # Make prediction
        prediction = app.state.predictor.predict(input_data)
        
        return PredictionResponse(**prediction)
        
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data/stats")
async def get_data_statistics():
    """Get overall data statistics"""
    try:
        from main import app
        import pandas as pd
        
        if not app.state.predictor:
            raise HTTPException(status_code=503, detail="ML model not loaded")
        
        stats = app.state.predictor.get_data_statistics()
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data/features")
async def get_available_features():
    """Get list of available features and their values"""
    try:
        from main import app
        
        if not app.state.predictor:
            raise HTTPException(status_code=503, detail="ML model not loaded")
        
        features = app.state.predictor.get_feature_options()
        return features
        
    except Exception as e:
        logger.error(f"Failed to get features: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/data/hotspots")
async def get_accident_hotspots(request: HotspotRequest):
    """Get accident hotspots with filtering"""
    try:
        from main import app
        
        if not app.state.predictor:
            raise HTTPException(status_code=503, detail="ML model not loaded")
        
        hotspots = app.state.predictor.get_hotspots(
            min_date=request.min_date,
            max_date=request.max_date,
            severity_filter=request.severity_filter,
            limit=request.limit
        )
        
        return hotspots
        
    except Exception as e:
        logger.error(f"Failed to get hotspots: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data/temporal-trends")
async def get_temporal_trends(
    frequency: str = Query("monthly", enum=["daily", "weekly", "monthly", "yearly"]),
    severity: Optional[str] = None
):
    """Get temporal trends of accidents"""
    try:
        from main import app
        
        if not app.state.predictor:
            raise HTTPException(status_code=503, detail="ML model not loaded")
        
        trends = app.state.predictor.get_temporal_trends(frequency, severity)
        return trends
        
    except Exception as e:
        logger.error(f"Failed to get trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model/metrics")
async def get_model_metrics():
    """Get ML model performance metrics"""
    try:
        from main import app
        
        if not app.state.predictor:
            raise HTTPException(status_code=503, detail="ML model not loaded")
        
        metrics = app.state.predictor.get_model_metrics()
        return metrics
        
    except Exception as e:
        logger.error(f"Failed to get model metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))