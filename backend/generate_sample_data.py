import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_sample_data(n_samples=10000):
    """Generate sample accident data for testing"""
    
    np.random.seed(42)
    
    # Generate dates
    start_date = datetime(2020, 1, 1)
    dates = [start_date + timedelta(days=np.random.randint(0, 365*3)) 
             for _ in range(n_samples)]
    
    # Generate times
    times = [f"{np.random.randint(0, 24):02d}:{np.random.randint(0, 60):02d}" 
             for _ in range(n_samples)]
    
    # Create DataFrame
    data = pd.DataFrame({
        'Accident_Index': [f'ACC{i:06d}' for i in range(n_samples)],
        'Longitude': np.random.uniform(-0.5, 0.5, n_samples),
        'Latitude': np.random.uniform(51.0, 52.0, n_samples),
        'Date': [d.strftime('%Y-%m-%d') for d in dates],
        'Time': times,
        'Accident_Severity': np.random.choice([1, 2, 3], n_samples, p=[0.7, 0.2, 0.1]),
        'Weather_Conditions': np.random.choice(
            ['Fine no high winds', 'Raining no high winds', 'Fine + high winds', 
             'Raining + high winds', 'Fog or mist', 'Other'], n_samples
        ),
        'Light_Conditions': np.random.choice(
            ['Daylight', 'Darkness - lights lit', 'Darkness - lights unlit', 
             'Darkness - no lighting'], n_samples
        ),
        'Road_Type': np.random.choice(
            ['Single carriageway', 'Dual carriageway', 'One way street', 
             'Roundabout', 'Slip road'], n_samples
        ),
        'Speed_limit': np.random.choice([20, 30, 40, 50, 60, 70], n_samples),
        'Road_Surface_Conditions': np.random.choice(
            ['Dry', 'Wet or damp', 'Snow', 'Frost or ice', 'Flood over 3cm deep'], n_samples
        ),
        'Junction_Detail': np.random.choice(
            ['Not at junction or within 20 metres', 'T or staggered junction', 
             'Crossroads', 'Roundabout', 'Other junction'], n_samples
        ),
        'Urban_or_Rural_Area': np.random.choice(['Urban', 'Rural'], n_samples, p=[0.7, 0.3]),
    })
    
    # Map severity codes to labels
    data['Accident_Severity'] = data['Accident_Severity'].map({
        1: 'Fatal',
        2: 'Serious',
        3: 'Slight'
    })
    
    # Save to CSV
    output_path = 'app/data/AccidentsBig_processed.csv'
    data.to_csv(output_path, index=False)
    print(f"Generated sample data with {n_samples} records saved to {output_path}")
    
    return data

if __name__ == "__main__":
    generate_sample_data(50000)