import React, { useState } from 'react';
import { 
  Row, Col, Card, Form, Button, Spinner, 
  Alert, Badge, Tabs, Tab 
} from 'react-bootstrap';
import { 
  FaSearch, FaChartPie, FaClock, FaThermometerHalf, 
  FaRoad, FaCarCrash, FaLightbulb 
} from 'react-icons/fa';
import PredictionForm from '../components/PredictionForm';

const Analysis = () => {
  const [loading] = useState(false);
  const [error] = useState(null);

  const featureOptions = {
    weather_conditions: ['Fine no high winds', 'Raining no high winds', 'Fine + high winds', 'Fog or mist'],
    light_conditions: ['Daylight', 'Darkness - lights lit', 'Darkness - lights unlit'],
    road_type: ['Single carriageway', 'Dual carriageway', 'One way street', 'Roundabout'],
    road_surface_conditions: ['Dry', 'Wet or damp', 'Snow', 'Frost or ice'],
    junction_detail: ['Not at junction', 'T junction', 'Crossroads', 'Roundabout'],
    urban_or_rural_area: ['Urban', 'Rural']
  };

  return (
    <div className="analysis-page">
      <Row className="mb-4">
        <Col>
          <h2 className="page-title">
            <FaChartPie className="me-2" />
            Advanced Analysis & Prediction
          </h2>
          <p className="text-muted">Explore patterns and predict accident severity using AI</p>
        </Col>
      </Row>

      <Tabs defaultActiveKey="prediction" className="mb-4">
        <Tab eventKey="prediction" title={
          <span>
            <FaCarCrash className="me-2" />
            Severity Prediction
          </span>
        }>
          <Row className="mt-4">
            <Col lg={8}>
              <PredictionForm featureOptions={featureOptions} />
            </Col>
            <Col lg={4}>
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">
                    <FaLightbulb className="me-2" />
                    Prediction Insights
                  </h5>
                </Card.Header>
                <Card.Body>
                  <h6>How it works:</h6>
                  <ul className="small">
                    <li>Enter accident conditions in the form</li>
                    <li>Our AI model analyzes patterns</li>
                    <li>Get severity prediction with confidence score</li>
                    <li>Review top contributing factors</li>
                  </ul>
                  
                  <hr />
                  <h6>Model Performance:</h6>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    <Badge bg="success">
                      Accuracy: 85.2%
                    </Badge>
                    <Badge bg="primary">
                      Precision: 83.7%
                    </Badge>
                    <Badge bg="warning">
                      Recall: 82.9%
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="analysis" title={
          <span>
            <FaSearch className="me-2" />
            Data Analysis
          </span>
        }>
          <Row className="mt-4">
            <Col>
              <Card className="shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">Coming Soon</h5>
                </Card.Header>
                <Card.Body className="text-center py-5">
                  <FaChartPie size={48} className="text-muted mb-3" />
                  <h5>Advanced Analysis Features</h5>
                  <p className="text-muted">
                    Interactive charts, temporal analysis, and detailed insights
                    will be available in the next update.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {error && (
        <Alert variant="danger" className="mt-4">
          {error}
        </Alert>
      )}
    </div>
  );
};

export default Analysis;