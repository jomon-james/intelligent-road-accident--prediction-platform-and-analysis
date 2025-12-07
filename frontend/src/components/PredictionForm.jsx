import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import { 
  FaCloudSun, FaCar, FaRoad, FaTrafficLight, 
  FaTachometerAlt, FaUserInjured, FaExclamationTriangle 
} from 'react-icons/fa';

const PredictionForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    weather_conditions: 'Clear',
    light_conditions: 'Daylight',
    road_type: 'Highway',
    speed_limit: '60',
    vehicle_type: 'Car',
    junction_control: 'Signalized',
    road_surface: 'Dry',
    pedestrian_involved: 'No',
    alcohol_involved: 'No',
    driver_age: '30-45',
    time_of_day: 'Day'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="pro-card prediction-form">
      <Card.Header className="pro-card-header">
        <h4 className="pro-card-title mb-0">
          <FaExclamationTriangle className="me-2" />
          Accident Severity Predictor
        </h4>
        <p className="mb-0 mt-1" style={{ opacity: 0.9, fontSize: '0.9rem' }}>
          Enter accident conditions to predict severity level
        </p>
      </Card.Header>
      
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            {/* Weather Conditions */}
            <Col md={6}>
              <div className="form-section">
                <div className="form-icon">
                  <FaCloudSun />
                </div>
                <div className="form-content">
                  <Form.Label className="pro-form-label">Weather Conditions</Form.Label>
                  <Form.Select 
                    name="weather_conditions"
                    value={formData.weather_conditions}
                    onChange={handleChange}
                    className="pro-form-control"
                  >
                    <option value="Clear">Clear</option>
                    <option value="Rain">Rain</option>
                    <option value="Snow">Snow</option>
                    <option value="Fog">Fog</option>
                    <option value="Storm">Storm</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </div>
              </div>
            </Col>

            {/* Light Conditions */}
            <Col md={6}>
              <div className="form-section">
                <div className="form-icon">
                  <FaCloudSun />
                </div>
                <div className="form-content">
                  <Form.Label className="pro-form-label">Light Conditions</Form.Label>
                  <Form.Select 
                    name="light_conditions"
                    value={formData.light_conditions}
                    onChange={handleChange}
                    className="pro-form-control"
                  >
                    <option value="Daylight">Daylight</option>
                    <option value="Dawn/Dusk">Dawn/Dusk</option>
                    <option value="Dark-Lighted">Dark - Lighted</option>
                    <option value="Dark-NotLighted">Dark - Not Lighted</option>
                  </Form.Select>
                </div>
              </div>
            </Col>

            {/* Road Type */}
            <Col md={6}>
              <div className="form-section">
                <div className="form-icon">
                  <FaRoad />
                </div>
                <div className="form-content">
                  <Form.Label className="pro-form-label">Road Type</Form.Label>
                  <Form.Select 
                    name="road_type"
                    value={formData.road_type}
                    onChange={handleChange}
                    className="pro-form-control"
                  >
                    <option value="Highway">Highway</option>
                    <option value="Arterial">Arterial Road</option>
                    <option value="Collector">Collector Road</option>
                    <option value="Local">Local Street</option>
                    <option value="Rural">Rural Road</option>
                  </Form.Select>
                </div>
              </div>
            </Col>

            {/* Speed Limit */}
            <Col md={6}>
              <div className="form-section">
                <div className="form-icon">
                  <FaTachometerAlt />
                </div>
                <div className="form-content">
                  <Form.Label className="pro-form-label">Speed Limit (km/h)</Form.Label>
                  <Form.Select 
                    name="speed_limit"
                    value={formData.speed_limit}
                    onChange={handleChange}
                    className="pro-form-control"
                  >
                    <option value="30">30 km/h</option>
                    <option value="40">40 km/h</option>
                    <option value="50">50 km/h</option>
                    <option value="60">60 km/h</option>
                    <option value="70">70 km/h</option>
                    <option value="80">80 km/h</option>
                    <option value="90">90 km/h</option>
                    <option value="100">100 km/h</option>
                    <option value="110">110 km/h</option>
                    <option value="120">120 km/h</option>
                  </Form.Select>
                </div>
              </div>
            </Col>

            {/* Vehicle Type */}
            <Col md={6}>
              <div className="form-section">
                <div className="form-icon">
                  <FaCar />
                </div>
                <div className="form-content">
                  <Form.Label className="pro-form-label">Vehicle Type</Form.Label>
                  <Form.Select 
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleChange}
                    className="pro-form-control"
                  >
                    <option value="Car">Car</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Truck">Truck</option>
                    <option value="Bus">Bus</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Pedestrian">Pedestrian</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </div>
              </div>
            </Col>

            {/* Junction Control */}
            <Col md={6}>
              <div className="form-section">
                <div className="form-icon">
                  <FaTrafficLight />
                </div>
                <div className="form-content">
                  <Form.Label className="pro-form-label">Junction Control</Form.Label>
                  <Form.Select 
                    name="junction_control"
                    value={formData.junction_control}
                    onChange={handleChange}
                    className="pro-form-control"
                  >
                    <option value="Signalized">Signalized</option>
                    <option value="Stop Sign">Stop Sign</option>
                    <option value="Yield">Yield</option>
                    <option value="Roundabout">Roundabout</option>
                    <option value="None">No Control</option>
                  </Form.Select>
                </div>
              </div>
            </Col>

            {/* Road Surface */}
            <Col md={6}>
              <div className="form-section">
                <div className="form-icon">
                  <FaRoad />
                </div>
                <div className="form-content">
                  <Form.Label className="pro-form-label">Road Surface Condition</Form.Label>
                  <Form.Select 
                    name="road_surface"
                    value={formData.road_surface}
                    onChange={handleChange}
                    className="pro-form-control"
                  >
                    <option value="Dry">Dry</option>
                    <option value="Wet">Wet</option>
                    <option value="Snow">Snow</option>
                    <option value="Ice">Ice</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </div>
              </div>
            </Col>

            {/* Pedestrian Involved */}
            <Col md={6}>
              <div className="form-section">
                <div className="form-icon">
                  <FaUserInjured />
                </div>
                <div className="form-content">
                  <Form.Label className="pro-form-label">Pedestrian Involved</Form.Label>
                  <Form.Select 
                    name="pedestrian_involved"
                    value={formData.pedestrian_involved}
                    onChange={handleChange}
                    className="pro-form-control"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </Form.Select>
                </div>
              </div>
            </Col>

            {/* Additional Factors */}
            <Col md={6}>
              <div className="form-section">
                <div className="form-icon">
                  <FaExclamationTriangle />
                </div>
                <div className="form-content">
                  <Form.Label className="pro-form-label">Alcohol Involved</Form.Label>
                  <Form.Select 
                    name="alcohol_involved"
                    value={formData.alcohol_involved}
                    onChange={handleChange}
                    className="pro-form-control"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </Form.Select>
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="form-section">
                <div className="form-icon">
                  <FaUserInjured />
                </div>
                <div className="form-content">
                  <Form.Label className="pro-form-label">Driver Age Group</Form.Label>
                  <Form.Select 
                    name="driver_age"
                    value={formData.driver_age}
                    onChange={handleChange}
                    className="pro-form-control"
                  >
                    <option value="<18">Under 18</option>
                    <option value="18-30">18-30</option>
                    <option value="30-45">30-45</option>
                    <option value="45-60">45-60</option>
                    <option value="60+">60+</option>
                  </Form.Select>
                </div>
              </div>
            </Col>
          </Row>

          {/* Submit Button */}
          <div className="text-center mt-5">
            <Button 
              type="submit" 
              className="btn-pro btn-primary-pro px-5"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Analyzing Conditions...
                </>
              ) : (
                <>
                  <FaExclamationTriangle className="me-2" />
                  Predict Accident Severity
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PredictionForm;