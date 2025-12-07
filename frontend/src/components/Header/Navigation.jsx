import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaHome, FaChartBar, FaMapMarkerAlt, 
  FaCog, FaHistory, FaUser 
} from 'react-icons/fa';

const Navigation = ({ currentPath, userRole }) => {
  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: <FaHome />,
      allowedRoles: ['user', 'admin']
    },
    {
      path: '/predict',
      label: 'Predict',
      icon: <FaMapMarkerAlt />,
      allowedRoles: ['user', 'admin']
    },
    {
      path: '/analysis',
      label: 'Analysis',
      icon: <FaChartBar />,
      allowedRoles: ['user', 'admin']
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: <FaUser />,
      allowedRoles: ['user', 'admin']
    },
    {
      path: '/admin',
      label: 'Admin',
      icon: <FaCog />,
      allowedRoles: ['admin']
    }
  ];

  return (
    <Nav className="navbar-nav">
      {navItems.map((item) => {
        if (!item.allowedRoles.includes(userRole || 'user')) return null;
        
        return (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
            active={currentPath === item.path}
            className="nav-item-link"
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Nav.Link>
        );
      })}
    </Nav>
  );
};

export default Navigation;