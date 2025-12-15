import pandas as pd
import numpy as np
from datetime import datetime, time
import logging
from sqlalchemy.orm import Session
from . import models, crud
from .database import SessionLocal, init_db
import os
from config import Config

logger = logging.getLogger(__name__)

def preprocess_accident_data(df: pd.DataFrame) -> pd.DataFrame:
    """Preprocess accident data for database insertion"""
    # Rename columns to match database schema
    column_mapping = {
        'Accident_Index': 'accident_index',
        'Longitude': 'longitude',
        'Latitude': 'latitude',
        'Date': 'accident_date',
        'Time': 'accident_time',
        'Accident_Severity': 'severity',
        'Weather_Conditions': 'weather_conditions',
        'Light_Conditions': 'light_conditions',
        'Road_Type': 'road_type',
        'Speed_limit': 'speed_limit',
        'Road_Surface_Conditions': 'road_surface_conditions',
        'Junction_Detail': 'junction_detail',
        'Urban_or_Rural_Area': 'urban_or_rural_area'
    }
    
    # Rename columns
    df = df.rename(columns={k: v for k, v in column_mapping.items() if k in df.columns})
    
    # Convert date and time
    if 'accident_date' in df.columns:
        df['accident_date'] = pd.to_datetime(df['accident_date'], errors='coerce').dt.date
    
    if 'accident_time' in df.columns:
        # Convert time string to datetime.time
        def parse_time(time_str):
            try:
                if pd.isna(time_str):
                    return None
                # Handle various time formats
                if isinstance(time_str, str):
                    if ':' in time_str:
                        hour, minute = map(int, time_str.split(':')[:2])
                        return time(hour=hour, minute=minute)
                return None
            except:
                return None
        
        df['accident_time'] = df['accident_time'].apply(parse_time)
        df['hour'] = df['accident_time'].apply(lambda x: x.hour if x else None)
    
    # Clean severity
    if 'severity' in df.columns:
        severity_mapping = {
            '1': 'Fatal',
            '2': 'Serious',
            '3': 'Slight',
            'Fatal': 'Fatal',
            'Serious': 'Serious',
            'Slight': 'Slight'
        }
        df['severity'] = df['severity'].map(severity_mapping)
    
    # Calculate derived features
    if 'accident_date' in df.columns:
        dates = pd.to_datetime(df['accident_date'])
        df['year'] = dates.dt.year
        df['month'] = dates.dt.month
        df['day'] = dates.dt.day
        df['day_of_week'] = dates.dt.dayofweek
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(bool)
    
    if 'hour' in df.columns:
        # Categorize time of day
        def categorize_time(hour):
            if hour is None:
                return 'Unknown'
            if hour < 6:
                return 'Night'
            elif hour < 12:
                return 'Morning'
            elif hour < 18:
                return 'Afternoon'
            else:
                return 'Evening'
        
        df['time_of_day'] = df['hour'].apply(categorize_time)
    
    # Handle missing values
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    categorical_cols = df.select_dtypes(include=['object']).columns
    
    for col in numeric_cols:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].median())
    
    for col in categorical_cols:
        if df[col].isnull().any():
            df[col] = df[col].fillna('Unknown')
    
    return df

def load_csv_to_db(csv_path: str = None, batch_size: int = 1000):
    """Load CSV data into database"""
    csv_path = csv_path or Config.DATA_PATH
    
    if not os.path.exists(csv_path):
        logger.error(f"CSV file not found: {csv_path}")
        return
    
    logger.info(f"Loading data from {csv_path}")
    
    try:
        # Read CSV in chunks
        chunks = pd.read_csv(csv_path, chunksize=batch_size)
        
        db = SessionLocal()
        crud_obj = crud.CRUD(db)
        
        total_loaded = 0
        
        for chunk in chunks:
            # Preprocess chunk
            processed_chunk = preprocess_accident_data(chunk)
            
            # Convert to list of dictionaries
            records = processed_chunk.to_dict('records')
            
            # Filter out records that already exist
            unique_records = []
            for record in records:
                if 'accident_index' in record and record['accident_index']:
                    existing = crud_obj.get_accident_by_index(record['accident_index'])
                    if not existing:
                        unique_records.append(record)
            
            if unique_records:
                # Insert records
                count = crud_obj.create_accidents_bulk(unique_records)
                total_loaded += count
                logger.info(f"Loaded {count} records, total: {total_loaded}")
        
        db.close()
        logger.info(f"Data migration completed. Total records loaded: {total_loaded}")
        
    except Exception as e:
        logger.error(f"Failed to load data: {e}")
        raise

def run_migration():
    """Run the data migration"""
    logger.info("Starting data migration...")
    
    # Initialize database
    init_db()
    
    # Load data
    load_csv_to_db()
    
    logger.info("Data migration completed successfully")

if __name__ == "__main__":
    run_migration()