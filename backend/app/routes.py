from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import pandas as pd
import json
import logging
from datetime import datetime
import uuid
from .ml_model.model_training import AccidentPredictor
from .database import get_db
from . import crud
from sqlalchemy.orm import Session
from .auth import get_current_admin_user

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
    prediction_id: Optional[str] = None

class HotspotRequest(BaseModel):
    """Request model for hotspot analysis"""
    min_date: Optional[str] = None
    max_date: Optional[str] = None
    severity_filter: Optional[List[str]] = None
    limit: int = 100

class UpdatePredictionOutcome(BaseModel):
    """Request model for updating prediction outcome"""
    actual_severity: str = Field(..., description="Actual severity (Fatal, Serious, Slight)")
    actual_severity_code: int = Field(..., description="Actual severity code")

@router.post("/predict", response_model=PredictionResponse)
async def predict_severity(
    request: PredictionRequest, 
    db: Session = Depends(get_db)
):
    """Predict accident severity based on input parameters"""
    try:
        from main import app
        
        if not app.state.predictor:
            raise HTTPException(status_code=503, detail="ML model not loaded")
        
        # Convert request to dict
        input_data = request.dict()
        
        # Make prediction
        prediction = app.state.predictor.predict(input_data)
        
        # Save prediction to database
        crud_obj = crud.CRUD(db)
        
        # Generate prediction ID
        prediction_id = f"PRED_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}"
        
        prediction_record = {
            "prediction_id": prediction_id,
            "input_data": json.dumps(input_data),
            "predicted_severity": prediction["severity"],
            "predicted_severity_code": prediction["severity_code"],
            "confidence": prediction["confidence"],
            "needs_manual_review": prediction["needs_manual_review"]
        }
        
        created_prediction = crud_obj.create_prediction(prediction_record)
        
        # Add prediction ID to response
        prediction["prediction_id"] = prediction_id
        
        return PredictionResponse(**prediction)
        
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/predictions/{prediction_id}/outcome")
async def update_prediction_outcome(
    prediction_id: str,
    outcome: UpdatePredictionOutcome,
    db: Session = Depends(get_db)
):
    """Update prediction with actual outcome"""
    try:
        crud_obj = crud.CRUD(db)
        
        # Map severity to code
        severity_code_map = {"Slight": 0, "Serious": 1, "Fatal": 2}
        actual_severity_code = severity_code_map.get(outcome.actual_severity)
        
        if actual_severity_code is None:
            raise HTTPException(status_code=400, detail="Invalid severity value")
        
        updated_prediction = crud_obj.update_prediction_outcome(
            prediction_id=prediction_id,
            actual_severity=outcome.actual_severity,
            actual_severity_code=actual_severity_code
        )
        
        if not updated_prediction:
            raise HTTPException(status_code=404, detail="Prediction not found")
        
        return {
            "status": "success",
            "message": "Prediction outcome updated",
            "prediction_id": prediction_id,
            "is_correct": updated_prediction.is_correct
        }
        
    except Exception as e:
        logger.error(f"Failed to update prediction outcome: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data/stats")
async def get_data_statistics(
    source: str = Query("database", enum=["database", "model"]),
    db: Session = Depends(get_db)
):
    """Get overall data statistics from database or model"""
    try:
        if source == "database":
            # Get statistics from database
            crud_obj = crud.CRUD(db)
            stats = crud_obj.get_accident_statistics()
            stats["source"] = "database"
        else:
            # Get statistics from model (backward compatibility)
            from main import app
            if not app.state.predictor:
                raise HTTPException(status_code=503, detail="ML model not loaded")
            
            stats = app.state.predictor.get_data_statistics()
            stats["source"] = "model"
        
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data/features")
async def get_available_features():
    """Get list of available features and their values from model"""
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
async def get_accident_hotspots(
    request: HotspotRequest,
    source: str = Query("database", enum=["database", "model"]),
    db: Session = Depends(get_db)
):
    """Get accident hotspots with filtering from database or model"""
    try:
        if source == "database":
            # Get hotspots from database
            crud_obj = crud.CRUD(db)
            
            # Parse dates
            start_date = None
            end_date = None
            
            if request.min_date:
                start_date = datetime.strptime(request.min_date, "%Y-%m-%d").date()
            if request.max_date:
                end_date = datetime.strptime(request.max_date, "%Y-%m-%d").date()
            
            hotspots = crud_obj.get_hotspots(
                limit=request.limit,
                severity_filter=request.severity_filter,
                start_date=start_date,
                end_date=end_date
            )
        else:
            # Get hotspots from model (backward compatibility)
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
    severity: Optional[str] = None,
    source: str = Query("database", enum=["database", "model"]),
    db: Session = Depends(get_db)
):
    """Get temporal trends of accidents from database or model"""
    try:
        if source == "database":
            # Get trends from database
            crud_obj = crud.CRUD(db)
            trends = crud_obj.get_temporal_trends(frequency, severity)
        else:
            # Get trends from model (backward compatibility)
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

# Database endpoints
@router.get("/db/stats")
async def get_database_statistics(db: Session = Depends(get_db)):
    """Get database statistics"""
    try:
        crud_obj = crud.CRUD(db)
        stats = crud_obj.get_accident_statistics()
        
        # Add additional database info
        total_predictions = db.query(crud.models.Prediction).count()
        reviewed_predictions = db.query(crud.models.Prediction).filter(
            crud.models.Prediction.is_correct.isnot(None)
        ).count()
        
        stats["predictions"] = {
            "total": total_predictions,
            "reviewed": reviewed_predictions,
            "pending_review": total_predictions - reviewed_predictions
        }
        
        return stats
    except Exception as e:
        logger.error(f"Failed to get database statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/db/migrate")
async def migrate_data(
    sample_only: bool = Query(False, description="Load only sample data (1000 records)"),
    db: Session = Depends(get_db)
):
    """Trigger data migration from CSV to database"""
    try:
        from .data_migration import load_csv_to_db
        
        # Get current count
        crud_obj = crud.CRUD(db)
        before_count = crud_obj.get_accident_statistics()["total_records"]
        
        # Run migration
        if sample_only:
            # Load sample data for testing
            from .ml_model.model_training import AccidentPredictor
            predictor = AccidentPredictor(use_database=False)
            sample_data = predictor.data.sample(n=min(1000, len(predictor.data)), random_state=42)
            
            # Convert to list of dictionaries
            records = sample_data.to_dict('records')
            
            # Insert sample data
            count = crud_obj.create_accidents_bulk(records)
            after_count = before_count + count
            
            message = f"Sample data ({count} records) loaded successfully"
        else:
            # Load full data
            load_csv_to_db()
            after_count = crud_obj.get_accident_statistics()["total_records"]
            message = "Full data migration completed"
        
        return {
            "status": "success",
            "message": message,
            "records_before": before_count,
            "records_after": after_count,
            "records_added": after_count - before_count,
            "sample_only": sample_only
        }
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/db/accidents")
async def get_accidents_from_db(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    severity: Optional[str] = Query(None, enum=["Fatal", "Serious", "Slight"]),
    start_date: Optional[str] = Query(None, regex=r'^\d{4}-\d{2}-\d{2}$'),
    end_date: Optional[str] = Query(None, regex=r'^\d{4}-\d{2}-\d{2}$'),
    min_latitude: Optional[float] = Query(None, ge=-90, le=90),
    max_latitude: Optional[float] = Query(None, ge=-90, le=90),
    min_longitude: Optional[float] = Query(None, ge=-180, le=180),
    max_longitude: Optional[float] = Query(None, ge=-180, le=180),
    db: Session = Depends(get_db)
):
    """Get accidents from database with filtering"""
    try:
        crud_obj = crud.CRUD(db)
        
        # Parse dates
        start_date_obj = None
        end_date_obj = None
        
        if start_date:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
        if end_date:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
        
        accidents = crud_obj.get_accidents(
            skip=skip,
            limit=limit,
            severity=severity,
            start_date=start_date_obj,
            end_date=end_date_obj,
            min_latitude=min_latitude,
            max_latitude=max_latitude,
            min_longitude=min_longitude,
            max_longitude=max_longitude
        )
        
        return {
            "total_returned": len(accidents),
            "skip": skip,
            "limit": limit,
            "accidents": [accident.to_dict() for accident in accidents]
        }
    except Exception as e:
        logger.error(f"Failed to get accidents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/db/accidents/{accident_id}")
async def get_accident_by_id(
    accident_id: int,
    db: Session = Depends(get_db)
):
    """Get accident by ID"""
    try:
        crud_obj = crud.CRUD(db)
        accident = crud_obj.get_accident(accident_id)
        
        if not accident:
            raise HTTPException(status_code=404, detail="Accident not found")
        
        return accident.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get accident: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/db/predictions")
async def get_predictions_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    needs_review: Optional[bool] = None,
    sort_by: str = Query("created_at", enum=["created_at", "confidence", "severity"]),
    sort_order: str = Query("desc", enum=["asc", "desc"]),
    db: Session = Depends(get_db)
):
    """Get prediction history"""
    try:
        crud_obj = crud.CRUD(db)
        predictions = crud_obj.get_predictions(
            skip=skip,
            limit=limit,
            needs_review=needs_review
        )
        
        # Apply sorting
        if sort_by == "confidence":
            predictions.sort(key=lambda x: x.confidence, reverse=(sort_order == "desc"))
        elif sort_by == "severity":
            severity_order = {"Fatal": 0, "Serious": 1, "Slight": 2}
            predictions.sort(key=lambda x: severity_order.get(x.predicted_severity, 3), 
                           reverse=(sort_order == "desc"))
        elif sort_by == "created_at" and sort_order == "asc":
            predictions.sort(key=lambda x: x.created_at)
        
        return {
            "total_returned": len(predictions),
            "skip": skip,
            "limit": limit,
            "sort_by": sort_by,
            "sort_order": sort_order,
            "predictions": [prediction.to_dict() for prediction in predictions]
        }
    except Exception as e:
        logger.error(f"Failed to get predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/db/predictions/{prediction_id}")
async def get_prediction_by_id(
    prediction_id: str,
    db: Session = Depends(get_db)
):
    """Get prediction by ID"""
    try:
        crud_obj = crud.CRUD(db)
        
        # Search by prediction_id
        prediction = db.query(crud.models.Prediction).filter(
            crud.models.Prediction.prediction_id == prediction_id
        ).first()
        
        if not prediction:
            raise HTTPException(status_code=404, detail="Prediction not found")
        
        # Parse input data
        prediction_dict = prediction.to_dict()
        if prediction.input_data:
            prediction_dict["input_data"] = json.loads(prediction.input_data)
        
        return prediction_dict
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/db/prediction-metrics")
async def get_prediction_metrics(db: Session = Depends(get_db)):
    """Get prediction performance metrics"""
    try:
        crud_obj = crud.CRUD(db)
        metrics = crud_obj.get_prediction_metrics()
        
        # Add severity-wise accuracy if available
        predictions = db.query(crud.models.Prediction).filter(
            crud.models.Prediction.is_correct.isnot(None)
        ).all()
        
        if predictions:
            severity_stats = {}
            for pred in predictions:
                severity = pred.predicted_severity
                if severity not in severity_stats:
                    severity_stats[severity] = {"total": 0, "correct": 0}
                
                severity_stats[severity]["total"] += 1
                if pred.is_correct:
                    severity_stats[severity]["correct"] += 1
            
            # Calculate accuracy per severity
            for severity, stats in severity_stats.items():
                stats["accuracy"] = stats["correct"] / stats["total"] if stats["total"] > 0 else 0
            
            metrics["severity_wise_accuracy"] = severity_stats
        
        return metrics
    except Exception as e:
        logger.error(f"Failed to get prediction metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/db/feature-distribution")
async def get_feature_distribution(
    feature: str = Query(..., description="Feature name to analyze"),
    severity: Optional[str] = Query(None, enum=["Fatal", "Serious", "Slight"]),
    db: Session = Depends(get_db)
):
    """Get distribution of a specific feature"""
    try:
        # Get all accidents
        crud_obj = crud.CRUD(db)
        
        if severity:
            accidents = db.query(crud.models.Accident).filter(
                crud.models.Accident.severity == severity
            ).all()
        else:
            accidents = db.query(crud.models.Accident).all()
        
        # Extract feature values
        feature_values = []
        for accident in accidents:
            if hasattr(accident, feature):
                value = getattr(accident, feature)
                if value is not None:
                    feature_values.append(value)
        
        # Calculate statistics based on feature type
        if feature_values:
            # Check if feature is numeric
            if all(isinstance(v, (int, float)) for v in feature_values):
                stats = {
                    "type": "numeric",
                    "count": len(feature_values),
                    "mean": float(np.mean(feature_values)),
                    "median": float(np.median(feature_values)),
                    "min": float(np.min(feature_values)),
                    "max": float(np.max(feature_values)),
                    "std": float(np.std(feature_values))
                }
            else:
                # Categorical feature
                from collections import Counter
                value_counts = Counter(feature_values)
                stats = {
                    "type": "categorical",
                    "count": len(feature_values),
                    "unique_values": len(value_counts),
                    "distribution": dict(value_counts.most_common(20))  # Top 20 values
                }
        else:
            stats = {"error": "No data available for this feature"}
        
        return {
            "feature": feature,
            "severity_filter": severity,
            "stats": stats
        }
        
    except Exception as e:
        logger.error(f"Failed to get feature distribution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/db/clear-data")
async def clear_database_data(
    confirm: bool = Query(False, description="Must be true to proceed"),
    db: Session = Depends(get_db)
):
    """Clear all data from database (DANGER: irreversible)"""
    if not confirm:
        raise HTTPException(status_code=400, detail="Must confirm with confirm=true")
    
    try:
        # Get counts before deletion
        accident_count = db.query(crud.models.Accident).count()
        prediction_count = db.query(crud.models.Prediction).count()
        
        # Delete all records
        db.query(crud.models.Prediction).delete()
        db.query(crud.models.Accident).delete()
        db.commit()
        
        return {
            "status": "success",
            "message": "Database cleared successfully",
            "records_deleted": {
                "accidents": accident_count,
                "predictions": prediction_count
            }
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to clear database: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
# Add these admin-only endpoints to your existing routes
@router.get("/admin/system-info")
async def get_system_info(current_admin: User = Depends(get_current_admin_user)):
    """Get system information (admin only)"""
    import psutil
    import platform
    
    return {
        "system": {
            "platform": platform.platform(),
            "python_version": platform.python_version(),
            "cpu_usage": psutil.cpu_percent(),
            "memory_usage": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent
        },
        "service": {
            "start_time": app.state.start_time if hasattr(app.state, 'start_time') else None,
            "uptime": str(datetime.now() - app.state.start_time) if hasattr(app.state, 'start_time') else None
        }
    }

@router.delete("/admin/clear-cache")
async def clear_cache(current_admin: User = Depends(get_current_admin_user)):
    """Clear application cache (admin only)"""
    try:
        # Clear predictor cache if exists
        if hasattr(app.state, 'predictor'):
            app.state.predictor.cleanup()
        
        # Reinitialize predictor
        from .ml_model.model_training import AccidentPredictor
        app.state.predictor = AccidentPredictor()
        
        return {
            "status": "success",
            "message": "Cache cleared and model reloaded"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))