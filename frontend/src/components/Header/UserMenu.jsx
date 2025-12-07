import React from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUserCircle, FaSignOutAlt, FaUserCog, 
  FaBell, FaHistory, FaChartLine 
} from 'react-icons/fa';

const UserMenu = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="user-menu-wrapper">
      {/* Notifications */}
      <Dropdown className="notifications-dropdown me-3">
        <Dropdown.Toggle variant="link" className="notification-toggle">
          <FaBell size={20} />
          <Badge pill bg="danger" className="notification-badge">3</Badge>
        </Dropdown.Toggle>
        <Dropdown.Menu align="end" className="notification-menu">
          <Dropdown.Header>Notifications</Dropdown.Header>
          <Dropdown.Item>
            <div className="notification-item">
              <small className="text-muted">New prediction request received</small>
            </div>
          </Dropdown.Item>
          <Dropdown.Item>
            <div className="notification-item">
              <small className="text-muted">System update completed</small>
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* User Dropdown */}
      <Dropdown className="user-dropdown">
        <Dropdown.Toggle variant="link" className="user-toggle">
          <div className="user-avatar">
            <FaUserCircle size={32} />
            <div className="user-info">
              <span className="user-name">{user.name || 'User'}</span>
              <small className="user-role">
                {user.role === 'admin' ? 'Administrator' : 'User'}
              </small>
            </div>
          </div>
        </Dropdown.Toggle>

        <Dropdown.Menu align="end" className="user-dropdown-menu">
          <Dropdown.Header>
            <div className="text-center">
              <strong>{user.name || 'User'}</strong>
              <div className="text-muted">{user.email || 'No email'}</div>
            </div>
          </Dropdown.Header>
          
          <Dropdown.Divider />
          
          <Dropdown.Item as={Link} to="/profile">
            <FaUserCog className="me-2" />
            Profile Settings
          </Dropdown.Item>
          
          <Dropdown.Item as={Link} to="/history">
            <FaHistory className="me-2" />
            Prediction History
          </Dropdown.Item>
          
          {user.role === 'admin' && (
            <Dropdown.Item as={Link} to="/admin">
              <FaChartLine className="me-2" />
              Admin Dashboard
            </Dropdown.Item>
          )}
          
          <Dropdown.Divider />
          
          <Dropdown.Item onClick={handleLogout} className="text-danger">
            <FaSignOutAlt className="me-2" />
            Logout
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default UserMenu;