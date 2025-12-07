import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Signup from '../components/Auth/Signup';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();

  const handleSignup = (userData) => {
    // This function is passed to Signup component
    console.log('User signed up:', userData);
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
          <Col md={8} lg={6} xl={5}>
            <Signup onSignup={handleSignup} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SignupPage;