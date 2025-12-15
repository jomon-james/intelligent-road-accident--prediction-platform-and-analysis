from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_, or_
from typing import List, Optional, Dict, Any
import datetime
from . import models
import logging

logger = logging.getLogger(__name__)

class CRUD:
    """CRUD operations for the database"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # Accident operations
    def create_accident(self, accident_data: Dict[str, Any]) -> models.Accident:
        """Create a new accident record"""
        db_accident = models.Accident(**accident_data)
        self.db.add(db_accident)
        self.db.commit()
        self.db.refresh(db_accident)
        return db_accident
    
    def create_accidents_bulk(self, accidents_data: List[Dict[str, Any]]) -> int:
        """Create multiple accident records in bulk"""
        try:
            # Convert dicts to Accident objects
            db_accidents = [models.Accident(**data) for data in accidents_data]
            self.db.bulk_save_objects(db_accidents)
            self.db.commit()
            return len(db_accidents)
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create bulk accidents: {e}")
            raise
    
    def get_accident(self, accident_id: int) -> Optional[models.Accident]:
        """Get accident by ID"""
        return self.db.query(models.Accident).filter(models.Accident.id == accident_id).first()
    
    def get_accident_by_index(self, accident_index: str) -> Optional[models.Accident]:
        """Get accident by accident_index"""
        return self.db.query(models.Accident).filter(
            models.Accident.accident_index == accident_index
        ).first()
    
    def get_accidents(
        self, 
        skip: int = 0, 
        limit: int = 100,
        severity: Optional[str] = None,
        start_date: Optional[datetime.date] = None,
        end_date: Optional[datetime.date] = None,
        min_latitude: Optional[float] = None,
        max_latitude: Optional[float] = None,
        min_longitude: Optional[float] = None,
        max_longitude: Optional[float] = None
    ) -> List[models.Accident]:
        """Get accidents with filtering"""
        query = self.db.query(models.Accident)
        
        # Apply filters
        if severity:
            query = query.filter(models.Accident.severity == severity)
        
        if start_date:
            query = query.filter(models.Accident.accident_date >= start_date)
        
        if end_date:
            query = query.filter(models.Accident.accident_date <= end_date)
        
        if min_latitude:
            query = query.filter(models.Accident.latitude >= min_latitude)
        
        if max_latitude:
            query = query.filter(models.Accident.latitude <= max_latitude)
        
        if min_longitude:
            query = query.filter(models.Accident.longitude >= min_longitude)
        
        if max_longitude:
            query = query.filter(models.Accident.longitude <= max_longitude)
        
        # Order by date (newest first)
        query = query.order_by(desc(models.Accident.accident_date))
        
        return query.offset(skip).limit(limit).all()
    
    def get_accident_statistics(self) -> Dict[str, Any]:
        """Get statistics about accidents"""
        total = self.db.query(models.Accident).count()
        
        severity_counts = {}
        for severity in ["Fatal", "Serious", "Slight"]:
            count = self.db.query(models.Accident).filter(
                models.Accident.severity == severity
            ).count()
            severity_counts[severity] = count
        
        # Get date range
        min_date = self.db.query(func.min(models.Accident.accident_date)).scalar()
        max_date = self.db.query(func.max(models.Accident.accident_date)).scalar()
        
        # Get geographic range
        lat_range = self.db.query(
            func.min(models.Accident.latitude),
            func.max(models.Accident.latitude)
        ).first()
        
        lon_range = self.db.query(
            func.min(models.Accident.longitude),
            func.max(models.Accident.longitude)
        ).first()
        
        # Get top weather conditions
        weather_counts = {}
        weather_rows = self.db.query(
            models.Accident.weather_conditions,
            func.count(models.Accident.id)
        ).group_by(models.Accident.weather_conditions).order_by(
            func.count(models.Accident.id).desc()
        ).limit(5).all()
        
        for weather, count in weather_rows:
            if weather:
                weather_counts[weather] = count
        
        return {
            "total_records": total,
            "severity_distribution": severity_counts,
            "date_range": {
                "min": min_date.isoformat() if min_date else None,
                "max": max_date.isoformat() if max_date else None
            },
            "geographic_range": {
                "latitude": {
                    "min": float(lat_range[0]) if lat_range[0] else None,
                    "max": float(lat_range[1]) if lat_range[1] else None
                },
                "longitude": {
                    "min": float(lon_range[0]) if lon_range[0] else None,
                    "max": float(lon_range[1]) if lon_range[1] else None
                }
            },
            "top_weather_conditions": weather_counts
        }
    
    def get_hotspots(
        self, 
        limit: int = 100,
        severity_filter: Optional[List[str]] = None,
        start_date: Optional[datetime.date] = None,
        end_date: Optional[datetime.date] = None
    ) -> List[Dict[str, Any]]:
        """Get accident hotspots"""
        query = self.db.query(models.Accident)
        
        if severity_filter:
            query = query.filter(models.Accident.severity.in_(severity_filter))
        
        if start_date:
            query = query.filter(models.Accident.accident_date >= start_date)
        
        if end_date:
            query = query.filter(models.Accident.accident_date <= end_date)
        
        # Get random sample if too many records
        accidents = query.order_by(func.random()).limit(limit).all()
        
        hotspots = []
        for accident in accidents:
            hotspots.append({
                "latitude": float(accident.latitude),
                "longitude": float(accident.longitude),
                "severity": accident.severity,
                "date": accident.accident_date.isoformat() if accident.accident_date else None,
                "weather": accident.weather_conditions,
                "road_type": accident.road_type,
                "accident_index": accident.accident_index
            })
        
        return hotspots
    
    def get_temporal_trends(
        self, 
        frequency: str = "monthly",
        severity: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get temporal trends of accidents"""
        # This is a simplified version - you might want to implement
        # more sophisticated aggregation based on frequency
        query = self.db.query(models.Accident)
        
        if severity:
            query = query.filter(models.Accident.severity == severity)
        
        query = query.order_by(models.Accident.accident_date)
        
        accidents = query.all()
        
        # Group by period
        trends_dict = {}
        for accident in accidents:
            if not accident.accident_date:
                continue
            
            if frequency == "yearly":
                period = str(accident.year)
            elif frequency == "monthly":
                period = f"{accident.year}-{accident.month:02d}"
            elif frequency == "daily":
                period = accident.accident_date.isoformat()
            else:
                period = f"{accident.year}-W{accident.accident_date.isocalendar()[1]}"
            
            if period not in trends_dict:
                trends_dict[period] = {"Slight": 0, "Serious": 0, "Fatal": 0}
            
            trends_dict[period][accident.severity] += 1
        
        # Convert to list format
        trends = []
        for period, counts in trends_dict.items():
            trend_data = {"period": period}
            trend_data.update(counts)
            trends.append(trend_data)
        
        return sorted(trends, key=lambda x: x["period"])
    
    # Prediction operations
    def create_prediction(self, prediction_data: Dict[str, Any]) -> models.Prediction:
        """Create a new prediction record"""
        db_prediction = models.Prediction(**prediction_data)
        self.db.add(db_prediction)
        self.db.commit()
        self.db.refresh(db_prediction)
        return db_prediction
    
    def update_prediction_outcome(
        self, 
        prediction_id: str, 
        actual_severity: str, 
        actual_severity_code: int
    ) -> Optional[models.Prediction]:
        """Update prediction with actual outcome"""
        prediction = self.db.query(models.Prediction).filter(
            models.Prediction.prediction_id == prediction_id
        ).first()
        
        if prediction:
            prediction.actual_severity = actual_severity
            prediction.actual_severity_code = actual_severity_code
            prediction.is_correct = (prediction.predicted_severity == actual_severity)
            self.db.commit()
            self.db.refresh(prediction)
        
        return prediction
    
    def get_predictions(
        self, 
        skip: int = 0, 
        limit: int = 100,
        needs_review: Optional[bool] = None
    ) -> List[models.Prediction]:
        """Get prediction history"""
        query = self.db.query(models.Prediction)
        
        if needs_review is not None:
            query = query.filter(models.Prediction.needs_manual_review == needs_review)
        
        query = query.order_by(desc(models.Prediction.created_at))
        
        return query.offset(skip).limit(limit).all()
    
    def get_prediction_metrics(self) -> Dict[str, Any]:
        """Get prediction performance metrics"""
        total = self.db.query(models.Prediction).count()
        
        if total == 0:
            return {"total": 0, "accuracy": 0}
        
        # Get predictions with actual outcomes
        reviewed = self.db.query(models.Prediction).filter(
            models.Prediction.is_correct.isnot(None)
        ).all()
        
        if not reviewed:
            return {"total": total, "reviewed": 0, "accuracy": 0}
        
        correct = sum(1 for p in reviewed if p.is_correct)
        accuracy = correct / len(reviewed) if reviewed else 0
        
        return {
            "total": total,
            "reviewed": len(reviewed),
            "accuracy": accuracy,
            "correct": correct,
            "incorrect": len(reviewed) - correct
        }