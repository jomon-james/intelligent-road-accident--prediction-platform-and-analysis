import React from 'react';
import { Card, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const PredictionResult = ({ prediction }) => {
  if (!prediction) return null;

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'fatal': return 'danger';
      case 'serious': return 'warning';
      case 'slight': return 'success';
      default: return 'info';
    }
  };

  const getRecommendation = (severity) => {
    const recommendations = {
      fatal: '🚨 IMMEDIATE ACTION REQUIRED: Contact emergency services immediately. Evacuate area if unsafe.',
      serious: '⚠️ URGENT ACTION: Call emergency services. Provide first aid if trained. Secure the scene.',
      slight: '✅ CAUTION NEEDED: Exchange information. Document the scene. File police report if needed.'
    };
    return recommendations[severity.toLowerCase()] || 'Proceed with caution.';
  };

  return (
    <Card className="pro-card">
      <Card.Header className="pro-card-header">
        <h5 className="pro-card-title mb-0">
          <FaExclamationTriangle className="me-2" />
          Prediction Result
        </h5>
      </Card.Header>
      
      <Card.Body>
        {/* Severity Alert */}
        <Alert variant={getSeverityColor(prediction.severity)} className="text-center">
          <h4 className="alert-heading d-flex align-items-center justify-content-center">
            <FaExclamationTriangle className="me-2" />
            {prediction.severity} Accident Predicted
          </h4>
          <div className="mt-2">
            <Badge bg="light" text="dark" className="fs-6 px-3 py-2">
              Confidence: {prediction.confidence}%
            </Badge>
            {prediction.needs_review && (
              <Badge bg="warning" className="ms-2 fs-6 px-3 py-2">
                ⚠️ Requires Manual Review
              </Badge>
            )}
          </div>
        </Alert>

        {/* Confidence Score */}
        <div className="mb-4">
          <h6>Prediction Confidence</h6>
          <div className="d-flex align-items-center">
            <ProgressBar 
              now={prediction.confidence} 
              className="flex-grow-1" 
              variant={getSeverityColor(prediction.severity)}
              style={{ height: '12px' }}
            />
            <span className="ms-3 fw-bold">{prediction.confidence}%</span>
          </div>
          <small className="text-muted">
            {prediction.confidence > 80 ? 'High confidence prediction' : 
             prediction.confidence > 60 ? 'Moderate confidence prediction' : 
             'Low confidence - manual review recommended'}
          </small>
        </div>

        {/* Risk Factors */}
        {prediction.factors && Object.keys(prediction.factors).length > 0 && (
          <div className="mb-4">
            <h6>Top Contributing Factors</h6>
            <div className="risk-factors">
              {Object.entries(prediction.factors).map(([factor, score], index) => (
                <div key={index} className="risk-factor-item mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="factor-name">{factor}</span>
                    <span className="factor-score">{Math.round(score * 100)}%</span>
                  </div>
                  <ProgressBar 
                    now={score * 100} 
                    variant="info"
                    style={{ height: '6px' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div className="mt-4">
          <h6>
            <FaInfoCircle className="me-2 text-primary" />
            Recommended Action
          </h6>
          <div className="recommendation-box p-3 bg-light rounded">
            <p className="mb-0">{getRecommendation(prediction.severity)}</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-3 border-top">
          <small className="text-muted">
            <FaCheckCircle className="me-1" />
            Prediction ID: {prediction.id || 'N/A'} | 
            Timestamp: {new Date(prediction.timestamp).toLocaleString()}
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PredictionResult;