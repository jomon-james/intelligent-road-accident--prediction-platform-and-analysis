import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Login from '../components/Auth/Login';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    // This function is passed to Login component
    console.log('User logged in:', userData);
  };

  return (
    <div className="auth-page" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Login onLogin={handleLogin} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;