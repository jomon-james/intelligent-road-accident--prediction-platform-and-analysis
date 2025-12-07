import React, { useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { FaExclamationTriangle, FaChartBar } from 'react-icons/fa';
import PredictionForm from '../components/Prediction/PredictionForm';
import PredictionResult from '../components/Prediction/PredictionResult';
import { api } from '../services/api';
import { toast } from 'react-toastify';

const Predict = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);

  const handlePrediction = async (formData) => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Call the API to get prediction
      const result = await api.predict(formData);
      
      // Add to prediction history
      const newPrediction = {
        ...result,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        formData: formData
      };
      
      setPrediction(newPrediction);
      setPredictionHistory(prev => [newPrediction, ...prev].slice(0, 10)); // Keep last 10
      
      toast.success('Prediction completed successfully!');
    } catch (err) {
      setError(err.message || 'Failed to get prediction');
      toast.error('Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'fatal': return 'danger';
      case 'serious': return 'warning';
      case 'slight': return 'success';
      default: return 'info';
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="page-header">
            <h1 className="page-title">
              <FaExclamationTriangle className="me-3" />
              Accident Severity Prediction
            </h1>
            <p className="page-subtitle">
              Enter accident conditions to predict severity using our AI model
            </p>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row className="g-4">
        {/* Prediction Form */}
        <Col lg={8}>
          <PredictionForm 
            onSubmit={handlePrediction} 
            loading={loading}
          />
          
          {/* Prediction History */}
          {predictionHistory.length > 0 && (
            <div className="mt-4">
              <div className="pro-card">
                <div className="pro-card-header">
                  <h5 className="pro-card-title mb-0">
                    <FaChartBar className="me-2" />
                    Recent Predictions
                  </h5>
                </div>
                <div className="p-3">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Severity</th>
                          <th>Confidence</th>
                          <th>Weather</th>
                          <th>Road Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictionHistory.map((pred, index) => (
                          <tr key={pred.id}>
                            <td>
                              {new Date(pred.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td>
                              <span className={`badge bg-${getSeverityColor(pred.severity)}`}>
                                {pred.severity}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                                  <div 
                                    className="progress-bar" 
                                    style={{ 
                                      width: `${pred.confidence}%`,
                                      backgroundColor: getSeverityColor(pred.severity) === 'danger' ? '#dc3545' :
                                                      getSeverityColor(pred.severity) === 'warning' ? '#ffc107' :
                                                      '#28a745'
                                    }}
                                  ></div>
                                </div>
                                <span>{pred.confidence}%</span>
                              </div>
                            </td>
                            <td>{pred.formData?.weather_conditions || 'N/A'}</td>
                            <td>{pred.formData?.road_type || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Col>

        {/* Results and Tips */}
        <Col lg={4}>
          <div className="sticky-top" style={{ top: '20px' }}>
            {/* Prediction Result */}
            {prediction && (
              <div className="fade-in mb-4">
                <PredictionResult prediction={prediction} />
              </div>
            )}

            {/* Prediction Tips */}
            <div className="pro-card">
              <div className="pro-card-header">
                <h5 className="pro-card-title mb-0">Prediction Tips</h5>
              </div>
              <div className="p-4">
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <small className="text-success">✓</small>
                    <span className="ms-2">More accurate results with complete information</span>
                  </li>
                  <li className="mb-2">
                    <small className="text-success">✓</small>
                    <span className="ms-2">Weather and light conditions significantly impact severity</span>
                  </li>
                  <li className="mb-2">
                    <small className="text-success">✓</small>
                    <span className="ms-2">Higher speeds increase accident severity</span>
                  </li>
                  <li className="mb-2">
                    <small className="text-success">✓</small>
                    <span className="ms-2">Wet/icy roads increase risk of serious accidents</span>
                  </li>
                  <li className="mb-2">
                    <small className="text-success">✓</small>
                    <span className="ms-2">Predictions with confidence below 80% require review</span>
                  </li>
                  <li>
                    <small className="text-success">✓</small>
                    <span className="ms-2">Pedestrian involvement increases severity rating</span>
                  </li>
                </ul>
                
                <div className="mt-4 pt-3 border-top">
                  <h6>Severity Guide:</h6>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    <span className="badge bg-danger">Fatal: Life-threatening</span>
                    <span className="badge bg-warning text-dark">Serious: Major injuries</span>
                    <span className="badge bg-success">Slight: Minor injuries</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="pro-card mt-4">
              <div className="pro-card-header">
                <h5 className="pro-card-title mb-0">Prediction Stats</h5>
              </div>
              <div className="p-4">
                <div className="row text-center">
                  <div className="col-4">
                    <h3 className="text-primary mb-1">{predictionHistory.length}</h3>
                    <small className="text-muted">Today</small>
                  </div>
                  <div className="col-4">
                    <h3 className="text-success mb-1">92.5%</h3>
                    <small className="text-muted">Accuracy</small>
                  </div>
                  <div className="col-4">
                    <h3 className="text-info mb-1">1.2s</h3>
                    <small className="text-muted">Avg. Time</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Predict;