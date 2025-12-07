import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6} className="text-center">
          <Card className="shadow-lg border-0" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '20px',
            padding: '40px 20px'
          }}>
            <FaExclamationTriangle size={80} className="mb-4" />
            <h1 className="display-1 fw-bold">404</h1>
            <h2 className="mb-4">Page Not Found</h2>
            <p className="lead mb-4" style={{ opacity: 0.9 }}>
              The page you are looking for might have been removed, had its name changed, 
              or is temporarily unavailable.
            </p>
            
            <div className="d-flex justify-content-center gap-3">
              <Link to="/">
                <Button variant="light" className="px-4 py-2">
                  <FaHome className="me-2" />
                  Go Home
                </Button>
              </Link>
              
              <Button 
                variant="outline-light" 
                className="px-4 py-2"
                onClick={() => window.history.back()}
              >
                <FaSearch className="me-2" />
                Go Back
              </Button>
            </div>
            
            <div className="mt-5">
              <p className="mb-2" style={{ opacity: 0.8 }}>You might be looking for:</p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/" className="text-white text-decoration-none">Dashboard</Link>
                <Link to="/predict" className="text-white text-decoration-none">Predict Severity</Link>
                <Link to="/analysis" className="text-white text-decoration-none">Analysis</Link>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;