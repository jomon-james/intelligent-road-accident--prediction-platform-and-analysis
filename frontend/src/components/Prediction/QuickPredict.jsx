import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { FaBolt, FaCar, FaRoad, FaCloudSun } from 'react-icons/fa';

const QuickPredict = ({ onPredict }) => {
  const [quickForm, setQuickForm] = useState({
    speed: '60',
    weather: 'Clear',
    road: 'Dry',
    time: 'Day'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuickForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPredict({
      speed_limit: quickForm.speed,
      weather_conditions: quickForm.weather,
      road_surface: quickForm.road,
      time_of_day: quickForm.time,
      vehicle_type: 'Car',
      light_conditions: quickForm.time === 'Day' ? 'Daylight' : 'Darkness'
    });
  };

  return (
    <Card className="pro-card">
      <Card.Header className="pro-card-header">
        <h5 className="pro-card-title mb-0">
          <FaBolt className="me-2" />
          Quick Prediction
        </h5>
      </Card.Header>
      
      <Card.Body>
        <Alert variant="info" className="small mb-3">
          Get instant severity prediction with key factors
        </Alert>
        
        <Form onSubmit={handleSubmit}>
          <div className="mb-3">
            <Form.Label className="d-flex align-items-center">
              <FaCar className="me-2" />
              Speed (km/h)
            </Form.Label>
            <Form.Select 
              name="speed"
              value={quickForm.speed}
              onChange={handleChange}
              className="pro-form-control"
            >
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
              <option value="60">60</option>
              <option value="70">70</option>
              <option value="80">80</option>
              <option value="90">90</option>
              <option value="100">100+</option>
            </Form.Select>
          </div>

          <div className="mb-3">
            <Form.Label className="d-flex align-items-center">
              <FaCloudSun className="me-2" />
              Weather
            </Form.Label>
            <Form.Select 
              name="weather"
              value={quickForm.weather}
              onChange={handleChange}
              className="pro-form-control"
            >
              <option value="Clear">Clear</option>
              <option value="Rain">Rain</option>
              <option value="Snow">Snow</option>
              <option value="Fog">Fog</option>
            </Form.Select>
          </div>

          <div className="mb-3">
            <Form.Label className="d-flex align-items-center">
              <FaRoad className="me-2" />
              Road Condition
            </Form.Label>
            <Form.Select 
              name="road"
              value={quickForm.road}
              onChange={handleChange}
              className="pro-form-control"
            >
              <option value="Dry">Dry</option>
              <option value="Wet">Wet</option>
              <option value="Snow">Snow/Ice</option>
              <option value="Other">Other</option>
            </Form.Select>
          </div>

          <div className="mb-4">
            <Form.Label>Time of Day</Form.Label>
            <div className="d-flex gap-2">
              {['Day', 'Night', 'Dawn/Dusk'].map(time => (
                <Button
                  key={time}
                  type="button"
                  variant={quickForm.time === time ? 'primary' : 'outline-primary'}
                  onClick={() => setQuickForm(prev => ({ ...prev, time }))}
                  className="flex-grow-1"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-100"
          >
            <FaBolt className="me-2" />
            Quick Predict
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default QuickPredict;