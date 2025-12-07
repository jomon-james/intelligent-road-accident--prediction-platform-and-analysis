import React from 'react';
import { Container, Navbar, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCarCrash, FaChartLine, FaUserCircle } from 'react-icons/fa';
import Navigation from './Navigation';
import UserMenu from './UserMenu';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="pro-header">
      <Container fluid>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/" className="brand-section">
          <div className="logo-wrapper">
            <FaCarCrash className="logo-icon" />
            <div className="logo-text">
              <h4 className="logo-title">Intelligent Road Safety</h4>
              <small className="logo-subtitle">Accident Analysis Platform</small>
            </div>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav">
          {/* Navigation Links */}
          <Navigation currentPath={location.pathname} userRole={user.role} />

          {/* User Actions */}
          <div className="user-section ms-auto">
            {user.email ? (
              <UserMenu user={user} />
            ) : (
              <div className="auth-buttons">
                <Button 
                  variant="outline-light" 
                  size="sm" 
                  className="me-2"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;