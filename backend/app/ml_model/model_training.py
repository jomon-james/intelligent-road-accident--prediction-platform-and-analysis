import pandas as pd
import numpy as np
import json
import joblib
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
import logging
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, 
    f1_score, confusion_matrix, classification_report
)
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class AccidentPredictor:
    """Machine Learning model for accident severity prediction"""
    
    def __init__(self, model_path: str = None, data_path: str = None):
        self.model = None
        self.preprocessor = None
        self.label_encoder = None
        self.feature_names = []
        self.data = None
        self.metrics = {}
        
        # Configuration
        from config import Config
        self.config = Config
        
        # Paths
        self.model_path = model_path or Config.MODEL_PATH
        self.preprocessor_path = Config.PREPROCESSOR_PATH
        self.features_path = Config.FEATURES_PATH
        self.data_path = data_path or Config.DATA_PATH
        
        # Initialize
        self._initialize()
    
    def _initialize(self):
        """Initialize the predictor by loading or training model"""
        try:
            # Try to load existing model
            self.load_model()
            logger.info("Model loaded from saved files")
        except:
            # Train new model if loading fails
            logger.info("No saved model found. Training new model...")
            self.load_and_preprocess_data()
            self.train_model()
            self.save_model()
    
    def load_and_preprocess_data(self):
        """Load and preprocess the accident data"""
        try:
            # Load data
            self.data = pd.read_csv(self.data_path)
            
            # Sample if data is too large
            if len(self.data) > 100000:
                self.data = self.data.sample(n=100000, random_state=42)
            
            logger.info(f"Loaded data with shape: {self.data.shape}")
            
            # Basic preprocessing
            self._preprocess_data()
            
        except Exception as e:
            logger.error(f"Failed to load data: {e}")
            # Create sample data for development
            self._create_sample_data()
    
    def _preprocess_data(self):
        """Preprocess the accident data"""
        # Rename columns to standard format
        column_mapping = {
            'Accident_Severity': 'severity',
            'Longitude': 'longitude',
            'Latitude': 'latitude',
            'Date': 'accident_date',
            'Time': 'accident_time',
            'Weather_Conditions': 'weather_conditions',
            'Light_Conditions': 'light_conditions',
            'Road_Type': 'road_type',
            'Speed_limit': 'speed_limit',
            'Road_Surface_Conditions': 'road_surface_conditions',
            'Junction_Detail': 'junction_detail',
            'Urban_or_Rural_Area': 'urban_or_rural_area'
        }
        
        # Rename columns that exist
        self.data = self.data.rename(columns={
            k: v for k, v in column_mapping.items() if k in self.data.columns
        })
        
        # Ensure required columns exist
        required_columns = ['severity', 'longitude', 'latitude', 'accident_date']
        for col in required_columns:
            if col not in self.data.columns:
                raise ValueError(f"Required column {col} not found in data")
        
        # Clean severity column
        if 'severity' in self.data.columns:
            self.data['severity'] = self.data['severity'].astype(str).str.strip()
            # Map to standard categories
            severity_mapping = {
                '1': 'Fatal',
                '2': 'Serious',
                '3': 'Slight',
                'Fatal': 'Fatal',
                'Serious': 'Serious',
                'Slight': 'Slight'
            }
            self.data['severity'] = self.data['severity'].map(severity_mapping)
            self.data = self.data[self.data['severity'].notna()]
        
        # Extract features from date and time
        if 'accident_date' in self.data.columns:
            self.data['accident_date'] = pd.to_datetime(self.data['accident_date'], errors='coerce')
            self.data['year'] = self.data['accident_date'].dt.year
            self.data['month'] = self.data['accident_date'].dt.month
            self.data['day'] = self.data['accident_date'].dt.day
            self.data['day_of_week'] = self.data['accident_date'].dt.dayofweek
            self.data['is_weekend'] = self.data['day_of_week'].isin([5, 6]).astype(int)
        
        if 'accident_time' in self.data.columns:
            # Convert time to hour
            self.data['accident_time'] = pd.to_datetime(self.data['accident_time'], format='%H:%M', errors='coerce').dt.hour
            self.data['hour'] = self.data['accident_time'].fillna(12)
            self.data['time_of_day'] = pd.cut(
                self.data['hour'], 
                bins=[0, 6, 12, 18, 24], 
                labels=['Night', 'Morning', 'Afternoon', 'Evening']
            )
        
        # Handle missing values
        numeric_cols = self.data.select_dtypes(include=[np.number]).columns
        categorical_cols = self.data.select_dtypes(include=['object']).columns
        
        for col in numeric_cols:
            if self.data[col].isnull().any():
                self.data[col] = self.data[col].fillna(self.data[col].median())
        
        for col in categorical_cols:
            if self.data[col].isnull().any():
                self.data[col] = self.data[col].fillna('Unknown')
    
    def _create_sample_data(self):
        """Create sample data for development/testing"""
        np.random.seed(42)
        n_samples = 1000
        
        # Generate sample data
        self.data = pd.DataFrame({
            'severity': np.random.choice(['Slight', 'Serious', 'Fatal'], n_samples, p=[0.7, 0.2, 0.1]),
            'longitude': np.random.uniform(-0.5, 0.5, n_samples),
            'latitude': np.random.uniform(51.0, 52.0, n_samples),
            'accident_date': pd.date_range('2020-01-01', periods=n_samples),
            'weather_conditions': np.random.choice(['Fine', 'Rain', 'Fog', 'Snow'], n_samples),
            'light_conditions': np.random.choice(['Daylight', 'Darkness', 'Dusk'], n_samples),
            'road_type': np.random.choice(['Single carriageway', 'Dual carriageway', 'Roundabout'], n_samples),
            'speed_limit': np.random.choice([30, 40, 50, 60, 70], n_samples),
            'road_surface_conditions': np.random.choice(['Dry', 'Wet', 'Snow/Ice'], n_samples),
            'junction_detail': np.random.choice(['Not at junction', 'T junction', 'Crossroads'], n_samples),
            'urban_or_rural_area': np.random.choice(['Urban', 'Rural'], n_samples),
        })
        
        # Add derived features
        self.data['year'] = self.data['accident_date'].dt.year
        self.data['month'] = self.data['accident_date'].dt.month
        self.data['day'] = self.data['accident_date'].dt.day
        self.data['hour'] = np.random.randint(0, 24, n_samples)
        self.data['day_of_week'] = np.random.randint(0, 7, n_samples)
        self.data['is_weekend'] = (self.data['day_of_week'] >= 5).astype(int)
        
        logger.info("Created sample data for development")
    
    def prepare_features(self):
        """Prepare features for model training"""
        # Define features to use
        feature_cols = [
            'longitude', 'latitude', 'hour', 'day_of_week', 'is_weekend',
            'speed_limit', 'month'
        ]
        
        categorical_cols = [
            'weather_conditions', 'light_conditions', 'road_type',
            'road_surface_conditions', 'junction_detail', 'urban_or_rural_area',
            'time_of_day'
        ]
        
        # Add categorical columns that exist
        categorical_cols = [col for col in categorical_cols if col in self.data.columns]
        feature_cols = feature_cols + categorical_cols
        
        # Filter to columns that exist
        feature_cols = [col for col in feature_cols if col in self.data.columns]
        
        X = self.data[feature_cols]
        y = self.data['severity']
        
        # Encode target variable
        self.label_encoder = LabelEncoder()
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        # Define preprocessing
        numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
        categorical_features = X.select_dtypes(include=['object']).columns.tolist()
        
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])
        
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
            ('onehot', pd.get_dummies)  # We'll handle this differently
        ])
        
        # For simplicity, we'll use pandas get_dummies
        X_train_processed = pd.get_dummies(X_train, columns=categorical_features)
        X_test_processed = pd.get_dummies(X_test, columns=categorical_features)
        
        # Align columns
        X_test_processed = X_test_processed.reindex(columns=X_train_processed.columns, fill_value=0)
        
        self.feature_names = X_train_processed.columns.tolist()
        
        return X_train_processed, X_test_processed, y_train, y_test
    
    def train_model(self):
        """Train the Random Forest model"""
        # Prepare data
        X_train, X_test, y_train, y_test = self.prepare_features()
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
            class_weight='balanced'
        )
        
        self.model.fit(X_train, y_train)
        
        # Make predictions
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)
        
        # Calculate metrics
        self.metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, average='weighted'),
            'recall': recall_score(y_test, y_pred, average='weighted'),
            'f1_score': f1_score(y_test, y_pred, average='weighted'),
            'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
            'classification_report': classification_report(y_test, y_pred, output_dict=True),
            'feature_importance': dict(zip(
                self.feature_names[:20],  # Top 20 features
                self.model.feature_importances_[:20]
            ))
        }
        
        logger.info(f"Model trained with accuracy: {self.metrics['accuracy']:.3f}")
        
        # Create simple preprocessor for inference
        self.preprocessor = {
            'feature_names': self.feature_names,
            'label_encoder': self.label_encoder,
            'categorical_columns': self.data.select_dtypes(include=['object']).columns.tolist()
        }
    
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction for input data"""
        try:
            # Convert input to DataFrame
            input_df = pd.DataFrame([input_data])
            
            # Extract features from date/time
            if 'accident_date' in input_df.columns:
                input_df['accident_date'] = pd.to_datetime(input_df['accident_date'])
                input_df['year'] = input_df['accident_date'].dt.year
                input_df['month'] = input_df['accident_date'].dt.month
                input_df['day'] = input_df['accident_date'].dt.day
                input_df['day_of_week'] = input_df['accident_date'].dt.dayofweek
                input_df['is_weekend'] = input_df['day_of_week'].isin([5, 6]).astype(int)
            
            if 'accident_time' in input_df.columns:
                # Convert time string to hour
                try:
                    time_obj = datetime.strptime(str(input_data['accident_time']), '%H:%M')
                    input_df['hour'] = time_obj.hour
                except:
                    input_df['hour'] = 12
                
                # Categorize time of day
                hour = input_df['hour'].iloc[0]
                if hour < 6:
                    time_of_day = 'Night'
                elif hour < 12:
                    time_of_day = 'Morning'
                elif hour < 18:
                    time_of_day = 'Afternoon'
                else:
                    time_of_day = 'Evening'
                input_df['time_of_day'] = time_of_day
            
            # Prepare features
            features_to_use = []
            for feature in self.feature_names:
                if feature in input_df.columns:
                    features_to_use.append(feature)
                else:
                    # Check if it's a one-hot encoded feature
                    base_feature = feature.split('_')[0]
                    if base_feature in input_df.columns:
                        # Create one-hot encoding
                        value = str(input_df[base_feature].iloc[0])
                        encoded_feature = f"{base_feature}_{value}"
                        if encoded_feature in self.feature_names:
                            features_to_use.append(encoded_feature)
                        else:
                            features_to_use.append(feature)  # Will be set to 0
            
            # Create feature vector
            feature_vector = np.zeros(len(self.feature_names))
            for i, feature in enumerate(self.feature_names):
                if feature in features_to_use:
                    # Find which input column contributes to this feature
                    for col in input_df.columns:
                        if col == feature:
                            feature_vector[i] = input_df[col].iloc[0]
                            break
                        elif '_' in feature:
                            # Check if it's a one-hot encoding
                            base, val = feature.split('_', 1)
                            if base == col and str(input_df[col].iloc[0]) == val:
                                feature_vector[i] = 1
                                break
            
            # Make prediction
            probabilities = self.model.predict_proba([feature_vector])[0]
            predicted_class = np.argmax(probabilities)
            confidence = probabilities[predicted_class]
            
            # Decode severity
            severity = self.label_encoder.inverse_transform([predicted_class])[0]
            
            # Check if needs manual review
            needs_review = confidence < self.config.CONFIDENCE_THRESHOLD
            
            # Get top contributing factors
            top_features_indices = np.argsort(self.model.feature_importances_)[-5:][::-1]
            top_factors = {
                self.feature_names[i]: float(self.model.feature_importances_[i])
                for i in top_features_indices
            }
            
            return {
                'severity': severity,
                'severity_code': int(predicted_class),
                'confidence': float(confidence),
                'needs_manual_review': needs_review,
                'factors': top_factors,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise
    
    def get_data_statistics(self) -> Dict[str, Any]:
        """Get statistics about the data"""
        if self.data is None:
            return {"error": "No data loaded"}
        
        stats = {
            'total_records': int(len(self.data)),
            'severity_distribution': self.data['severity'].value_counts().to_dict(),
            'date_range': {
                'min': str(self.data['accident_date'].min()) if 'accident_date' in self.data.columns else None,
                'max': str(self.data['accident_date'].max()) if 'accident_date' in self.data.columns else None
            },
            'geographic_range': {
                'longitude': {
                    'min': float(self.data['longitude'].min()),
                    'max': float(self.data['longitude'].max())
                },
                'latitude': {
                    'min': float(self.data['latitude'].min()),
                    'max': float(self.data['latitude'].max())
                }
            },
            'top_weather_conditions': self.data['weather_conditions'].value_counts().head(5).to_dict() if 'weather_conditions' in self.data.columns else {},
            'top_road_types': self.data['road_type'].value_counts().head(5).to_dict() if 'road_type' in self.data.columns else {}
        }
        
        return stats
    
    def get_feature_options(self) -> Dict[str, List[str]]:
        """Get available options for categorical features"""
        options = {}
        
        categorical_cols = [
            'weather_conditions', 'light_conditions', 'road_type',
            'road_surface_conditions', 'junction_detail', 'urban_or_rural_area'
        ]
        
        for col in categorical_cols:
            if col in self.data.columns:
                options[col] = self.data[col].dropna().unique().tolist()
        
        # Add numeric ranges
        options['speed_limit'] = {
            'min': int(self.data['speed_limit'].min()),
            'max': int(self.data['speed_limit'].max()),
            'common_values': [30, 40, 50, 60, 70]
        }
        
        return options
    
    def get_hotspots(self, min_date=None, max_date=None, severity_filter=None, limit=100):
        """Get accident hotspots"""
        df = self.data.copy()
        
        # Filter by date
        if min_date:
            df = df[df['accident_date'] >= pd.to_datetime(min_date)]
        if max_date:
            df = df[df['accident_date'] <= pd.to_datetime(max_date)]
        
        # Filter by severity
        if severity_filter:
            df = df[df['severity'].isin(severity_filter)]
        
        # Group by location and severity
        hotspots = []
        for severity in df['severity'].unique():
            severity_data = df[df['severity'] == severity]
            
            # Sample if too many points
            if len(severity_data) > limit:
                severity_data = severity_data.sample(n=limit, random_state=42)
            
            for _, row in severity_data.iterrows():
                hotspots.append({
                    'latitude': float(row['latitude']),
                    'longitude': float(row['longitude']),
                    'severity': row['severity'],
                    'date': str(row['accident_date']) if 'accident_date' in row else None,
                    'weather': row.get('weather_conditions'),
                    'road_type': row.get('road_type')
                })
        
        return hotspots[:limit]
    
    def get_temporal_trends(self, frequency='monthly', severity=None):
        """Get temporal trends of accidents"""
        df = self.data.copy()
        
        if severity:
            df = df[df['severity'] == severity]
        
        if 'accident_date' not in df.columns:
            return {'error': 'Date column not available'}
        
        # Group by time frequency
        df['date'] = pd.to_datetime(df['accident_date'])
        
        if frequency == 'daily':
            df['period'] = df['date'].dt.date
        elif frequency == 'weekly':
            df['period'] = df['date'].dt.to_period('W').dt.start_time.dt.date
        elif frequency == 'monthly':
            df['period'] = df['date'].dt.to_period('M').dt.start_time.dt.date
        elif frequency == 'yearly':
            df['period'] = df['date'].dt.year
        
        trends = df.groupby(['period', 'severity']).size().unstack(fill_value=0).reset_index()
        
        # Convert to list format
        result = []
        for _, row in trends.iterrows():
            period_data = {'period': str(row['period'])}
            for severity_type in ['Slight', 'Serious', 'Fatal']:
                if severity_type in row:
                    period_data[severity_type.lower()] = int(row[severity_type])
            result.append(period_data)
        
        return result
    
    def get_model_metrics(self):
        """Get model performance metrics"""
        return self.metrics
    
    def save_model(self):
        """Save model and preprocessor"""
        try:
            # Save model
            joblib.dump(self.model, self.model_path)
            
            # Save preprocessor info
            with open(self.features_path, 'w') as f:
                json.dump({
                    'feature_names': self.feature_names,
                    'categorical_columns': self.preprocessor['categorical_columns'],
                    'label_classes': self.label_encoder.classes_.tolist()
                }, f)
            
            logger.info(f"Model saved to {self.model_path}")
            
        except Exception as e:
            logger.error(f"Failed to save model: {e}")
    
    def load_model(self):
        """Load saved model and preprocessor"""
        try:
            # Load model
            self.model = joblib.load(self.model_path)
            
            # Load preprocessor info
            with open(self.features_path, 'r') as f:
                preprocessor_info = json.load(f)
            
            self.feature_names = preprocessor_info['feature_names']
            
            # Create label encoder
            self.label_encoder = LabelEncoder()
            self.label_encoder.classes_ = np.array(preprocessor_info['label_classes'])
            
            logger.info(f"Model loaded from {self.model_path}")
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def cleanup(self):
        """Cleanup resources"""
        self.model = None
        self.data = None
        self.preprocessor = None