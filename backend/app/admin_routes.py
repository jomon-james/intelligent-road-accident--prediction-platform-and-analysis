from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime, timedelta
from .auth import (
    get_current_admin_user, 
    authenticate_admin, 
    create_access_token,
    LoginRequest, Token, User
)
from .database import get_db
from . import crud
from sqlalchemy.orm import Session
from config import Config

router = APIRouter()
logger = logging.getLogger(__name__)

# Admin authentication endpoints
@router.post("/auth/login", response_model=Token)
async def admin_login(login_data: LoginRequest):
    """Admin login endpoint"""
    if not authenticate_admin(login_data.username, login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=Config.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": login_data.username},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/auth/me", response_model=User)
async def get_current_admin(current_admin: User = Depends(get_current_admin_user)):
    """Get current admin profile"""
    return current_admin

# Admin dashboard endpoints
@router.get("/dashboard/overview")
async def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get dashboard overview statistics"""
    try:
        crud_obj = crud.CRUD(db)
        
        # Get accident statistics
        accident_stats = crud_obj.get_accident_statistics()
        
        # Get prediction metrics
        prediction_metrics = crud_obj.get_prediction_metrics()
        
        # Get recent predictions
        recent_predictions = crud_obj.get_predictions(limit=10)
        
        # Get predictions needing review
        pending_review = crud_obj.get_predictions(needs_review=True, limit=10)
        
        # Get system health
        from main import app
        model_loaded = app.state.predictor is not None
        
        return {
            "accidents": accident_stats,
            "predictions": prediction_metrics,
            "recent_predictions": len(recent_predictions),
            "pending_review": len(pending_review),
            "system_health": {
                "model_loaded": model_loaded,
                "database": "connected",
                "api_status": "running"
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get dashboard overview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/predictions-analytics")
async def get_predictions_analytics(
    days: int = Query(7, ge=1, le=365),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get predictions analytics for the last N days"""
    try:
        import pandas as pd
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get predictions in date range
        crud_obj = crud.CRUD(db)
        all_predictions = crud_obj.get_predictions(limit=10000)  # Adjust limit as needed
        
        # Filter by date
        recent_predictions = [
            p for p in all_predictions 
            if p.created_at and p.created_date() >= start_date.date()
        ]
        
        # Convert to DataFrame for analysis
        df = pd.DataFrame([{
            'date': p.created_at.date() if p.created_at else None,
            'severity': p.predicted_severity,
            'confidence': p.confidence,
            'needs_review': p.needs_manual_review,
            'is_correct': p.is_correct
        } for p in recent_predictions])
        
        if df.empty:
            return {"message": "No predictions in the selected period"}
        
        # Calculate daily statistics
        df['date'] = pd.to_datetime(df['date'])
        daily_stats = df.groupby('date').agg({
            'severity': 'count',
            'confidence': 'mean',
            'needs_review': 'sum',
            'is_correct': lambda x: x.dropna().mean() if not x.dropna().empty else None
        }).reset_index()
        
        # Severity distribution
        severity_dist = df['severity'].value_counts().to_dict()
        
        # Confidence distribution
        confidence_bins = pd.cut(df['confidence'], bins=[0, 0.3, 0.6, 0.8, 1.0], 
                                labels=['Low', 'Medium', 'High', 'Very High'])
        confidence_dist = confidence_bins.value_counts().to_dict()
        
        return {
            "period": {
                "start": start_date.date().isoformat(),
                "end": end_date.date().isoformat(),
                "days": days
            },
            "total_predictions": len(df),
            "daily_statistics": daily_stats.to_dict('records'),
            "severity_distribution": severity_dist,
            "confidence_distribution": confidence_dist,
            "review_rate": (df['needs_review'].sum() / len(df)) * 100 if len(df) > 0 else 0,
            "accuracy_rate": df['is_correct'].dropna().mean() * 100 if not df['is_correct'].dropna().empty else None
        }
        
    except Exception as e:
        logger.error(f"Failed to get predictions analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/accident-analytics")
async def get_accident_analytics(
    days: int = Query(30, ge=1, le=3650),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get accident analytics for the last N days"""
    try:
        import pandas as pd
        from sqlalchemy import func
        
        crud_obj = crud.CRUD(db)
        
        # Get accidents
        accidents = crud_obj.get_accidents(limit=10000)
        
        if not accidents:
            return {"message": "No accident data available"}
        
        # Convert to DataFrame
        df = pd.DataFrame([{
            'date': acc.accident_date,
            'severity': acc.severity,
            'latitude': acc.latitude,
            'longitude': acc.longitude,
            'weather': acc.weather_conditions,
            'road_type': acc.road_type,
            'speed_limit': acc.speed_limit,
            'hour': acc.hour
        } for acc in accidents])
        
        if df.empty:
            return {"message": "No accident data in the selected period"}
        
        # Calculate daily trends
        df['date'] = pd.to_datetime(df['date'])
        daily_trends = df.groupby('date').agg({
            'severity': 'count',
            'severity': lambda x: (x == 'Fatal').sum()  # Fatal accidents count
        }).rename(columns={'severity': 'total', 'severity': 'fatal_count'}).reset_index()
        
        # Time of day analysis
        time_of_day = pd.cut(df['hour'], bins=[0, 6, 12, 18, 24], 
                            labels=['Night', 'Morning', 'Afternoon', 'Evening'])
        time_dist = time_of_day.value_counts().to_dict()
        
        # Weather analysis
        weather_dist = df['weather'].value_counts().head(10).to_dict()
        
        # Top locations (hotspots)
        # Group by rounded coordinates
        df['lat_rounded'] = df['latitude'].round(2)
        df['lon_rounded'] = df['longitude'].round(2)
        hotspots = df.groupby(['lat_rounded', 'lon_rounded']).size().nlargest(10).reset_index()
        hotspots = hotspots.rename(columns={0: 'count'})
        
        return {
            "total_accidents": len(df),
            "fatal_accidents": (df['severity'] == 'Fatal').sum(),
            "daily_trends": daily_trends.to_dict('records'),
            "time_of_day_distribution": time_dist,
            "weather_distribution": weather_dist,
            "top_hotspots": hotspots.to_dict('records'),
            "severity_distribution": df['severity'].value_counts().to_dict()
        }
        
    except Exception as e:
        logger.error(f"Failed to get accident analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dashboard/export-data")
async def export_data(
    data_type: str = Query(..., enum=["accidents", "predictions", "all"]),
    format: str = Query("json", enum=["json", "csv"]),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Export data for analysis"""
    try:
        import json
        import csv
        import io
        from fastapi.responses import StreamingResponse
        
        crud_obj = crud.CRUD(db)
        
        if data_type == "accidents" or data_type == "all":
            accidents = crud_obj.get_accidents(limit=100000)
            accident_data = [acc.to_dict() for acc in accidents]
        
        if data_type == "predictions" or data_type == "all":
            predictions = crud_obj.get_predictions(limit=100000)
            prediction_data = [pred.to_dict() for pred in predictions]
        
        if format == "json":
            data = {}
            if data_type in ["accidents", "all"]:
                data["accidents"] = accident_data
            if data_type in ["predictions", "all"]:
                data["predictions"] = prediction_data
            
            # Create JSON response
            json_str = json.dumps(data, indent=2, default=str)
            return StreamingResponse(
                io.StringIO(json_str),
                media_type="application/json",
                headers={
                    "Content-Disposition": f"attachment; filename={data_type}_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                }
            )
        
        else:  # CSV format
            output = io.StringIO()
            
            if data_type == "accidents":
                if accident_data:
                    writer = csv.DictWriter(output, fieldnames=accident_data[0].keys())
                    writer.writeheader()
                    writer.writerows(accident_data)
            
            elif data_type == "predictions":
                if prediction_data:
                    writer = csv.DictWriter(output, fieldnames=prediction_data[0].keys())
                    writer.writeheader()
                    writer.writerows(prediction_data)
            
            elif data_type == "all":
                # Combine both datasets
                if accident_data:
                    writer = csv.DictWriter(output, fieldnames=accident_data[0].keys())
                    writer.writeheader()
                    writer.writerows(accident_data)
                
                output.write("\n\n=== PREDICTIONS ===\n\n")
                
                if prediction_data:
                    writer = csv.DictWriter(output, fieldnames=prediction_data[0].keys())
                    writer.writeheader()
                    writer.writerows(prediction_data)
            
            return StreamingResponse(
                io.StringIO(output.getvalue()),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename={data_type}_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                }
            )
        
    except Exception as e:
        logger.error(f"Failed to export data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dashboard/retrain-model")
async def retrain_model(
    current_admin: User = Depends(get_current_admin_user)
):
    """Retrain the ML model with latest data"""
    try:
        from main import app
        from .ml_model.model_training import AccidentPredictor
        
        if not app.state.predictor:
            raise HTTPException(status_code=503, detail="ML model not loaded")
        
        # Retrain model
        logger.info("Admin triggered model retraining...")
        
        # Create new predictor instance with latest data
        new_predictor = AccidentPredictor()
        
        # Update app state
        app.state.predictor = new_predictor
        
        # Get new metrics
        metrics = new_predictor.get_model_metrics()
        
        return {
            "status": "success",
            "message": "Model retrained successfully",
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to retrain model: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/users")
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get list of users (admin only)"""
    try:
        users = db.query(models.User).offset(skip).limit(limit).all()
        
        return {
            "total": len(users),
            "users": [user.to_dict() for user in users]
        }
        
    except Exception as e:
        logger.error(f"Failed to get users: {e}")
        raise HTTPException(status_code=500, detail=str(e))