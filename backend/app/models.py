from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Date, Time, Boolean
from sqlalchemy.ext.declarative import declarative_base
import datetime
from .database import Base

class Accident(Base):
    """Accident data model"""
    __tablename__ = "accidents"
    
    id = Column(Integer, primary_key=True, index=True)
    accident_index = Column(String, unique=True, index=True)
    longitude = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    accident_date = Column(Date, nullable=False)
    accident_time = Column(Time, nullable=True)
    severity = Column(String, nullable=False)  # Fatal, Serious, Slight
    weather_conditions = Column(String, nullable=True)
    light_conditions = Column(String, nullable=True)
    road_type = Column(String, nullable=True)
    speed_limit = Column(Integer, nullable=True)
    road_surface_conditions = Column(String, nullable=True)
    junction_detail = Column(String, nullable=True)
    urban_or_rural_area = Column(String, nullable=True)
    
    # Derived features
    year = Column(Integer, nullable=True)
    month = Column(Integer, nullable=True)
    day = Column(Integer, nullable=True)
    hour = Column(Integer, nullable=True)
    day_of_week = Column(Integer, nullable=True)
    is_weekend = Column(Boolean, default=False)
    time_of_day = Column(String, nullable=True)  # Night, Morning, Afternoon, Evening
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "accident_index": self.accident_index,
            "longitude": self.longitude,
            "latitude": self.latitude,
            "accident_date": self.accident_date.isoformat() if self.accident_date else None,
            "accident_time": self.accident_time.strftime("%H:%M") if self.accident_time else None,
            "severity": self.severity,
            "weather_conditions": self.weather_conditions,
            "light_conditions": self.light_conditions,
            "road_type": self.road_type,
            "speed_limit": self.speed_limit,
            "road_surface_conditions": self.road_surface_conditions,
            "junction_detail": self.junction_detail,
            "urban_or_rural_area": self.urban_or_rural_area,
            "year": self.year,
            "month": self.month,
            "day": self.day,
            "hour": self.hour,
            "day_of_week": self.day_of_week,
            "is_weekend": self.is_weekend,
            "time_of_day": self.time_of_day
        }

class Prediction(Base):
    """Prediction history model"""
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(String, unique=True, index=True)
    
    # Input features
    input_data = Column(Text, nullable=False)  # JSON string
    predicted_severity = Column(String, nullable=False)
    predicted_severity_code = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=False)
    needs_manual_review = Column(Boolean, default=False)
    
    # Actual outcome (if available later)
    actual_severity = Column(String, nullable=True)
    actual_severity_code = Column(Integer, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    
    # Model info
    model_version = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "prediction_id": self.prediction_id,
            "predicted_severity": self.predicted_severity,
            "predicted_severity_code": self.predicted_severity_code,
            "confidence": self.confidence,
            "needs_manual_review": self.needs_manual_review,
            "actual_severity": self.actual_severity,
            "actual_severity_code": self.actual_severity_code,
            "is_correct": self.is_correct,
            "model_version": self.model_version,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
    
    # Add User model
class User(Base):
    """User model for authentication"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "full_name": self.full_name,
            "is_admin": self.is_admin,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }