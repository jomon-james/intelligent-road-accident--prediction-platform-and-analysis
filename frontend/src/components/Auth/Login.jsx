import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaLock, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      if (credentials.email && credentials.password) {
        const isAdmin = credentials.email.includes('admin') || 
                       credentials.email === 'admin@example.com';
        
        const userData = {
          email: credentials.email,
          name: credentials.email.split('@')[0],
          role: isAdmin ? 'admin' : 'user',
          token: 'mock-jwt-token-' + Date.now(),
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success('Login successful!');
        
        if (onLogin) onLogin(userData);
        navigate('/');
      } else {
        setError('Please enter valid credentials');
      }
      setLoading(false);
    }, 1000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Card className="auth-card">
      <Card.Header className="auth-header">
        <h4 className="auth-title">Sign In</h4>
        <p className="auth-subtitle">Enter your credentials to continue</p>
      </Card.Header>
      
      <Card.Body className="p-4">
        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <div className="input-group">
              <span className="input-group-text">
                <FaEnvelope />
              </span>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={handleChange}
                required
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <div className="input-group">
              <span className="input-group-text">
                <FaLock />
              </span>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <Form.Check
              type="checkbox"
              name="remember"
              label="Remember me"
              checked={credentials.remember}
              onChange={handleChange}
            />
            <Link to="/forgot-password" className="text-primary text-decoration-none">
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            variant="primary"
            className="w-100 py-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Signing in...
              </>
            ) : (
              <>
                <FaSignInAlt className="me-2" />
                Sign In
              </>
            )}
          </Button>

          <div className="text-center mt-4">
            <p className="text-muted mb-0">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary fw-bold text-decoration-none">
                Sign up
              </Link>
            </p>
          </div>

          <div className="text-center mt-4 pt-3 border-top">
            <small className="text-muted">
              <strong>Demo accounts:</strong> <br/>
              admin@example.com / admin123 (Admin) <br/>
              user@example.com / user123 (User)
            </small>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Login;