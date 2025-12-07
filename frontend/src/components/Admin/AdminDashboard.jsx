import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { 
  FaUsers, FaChartBar, FaHistory, FaCog, 
  FaDatabase, FaShieldAlt, FaServer 
} from 'react-icons/fa';

const AdminDashboard = ({ stats }) => {
  const adminCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || '0',
      icon: <FaUsers />,
      color: 'primary',
      description: 'Registered users'
    },
    {
      title: 'Total Predictions',
      value: stats?.totalPredictions || '0',
      icon: <FaChartBar />,
      color: 'success',
      description: 'Predictions made'
    },
    {
      title: 'Model Accuracy',
      value: stats?.accuracy || '0%',
      icon: <FaShieldAlt />,
      color: 'info',
      description: 'Current accuracy'
    },
    {
      title: 'System Uptime',
      value: stats?.uptime || '0%',
      icon: <FaServer />,
      color: 'warning',
      description: 'Last 30 days'
    },
    {
      title: 'Database Size',
      value: stats?.dbSize || '0 MB',
      icon: <FaDatabase />,
      color: 'secondary',
      description: 'Current size'
    },
    {
      title: 'Active Sessions',
      value: stats?.activeSessions || '0',
      icon: <FaHistory />,
      color: 'danger',
      description: 'Current sessions'
    }
  ];

  return (
    <Row className="g-4">
      {adminCards.map((card, index) => (
        <Col key={index} xl={2} lg={4} md={6}>
          <Card className="admin-stat-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className={`admin-stat-icon bg-${card.color}`}>
                  {card.icon}
                </div>
                <div className="ms-3">
                  <h3 className="admin-stat-value">{card.value}</h3>
                  <p className="admin-stat-label">{card.title}</p>
                  <small className="admin-stat-desc">{card.description}</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default AdminDashboard;