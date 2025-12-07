import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { 
  FaCarCrash, FaUserInjured, FaAmbulance, 
  FaExclamationTriangle, FaChartLine, FaClock 
} from 'react-icons/fa';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Accidents',
      value: stats?.total || '1,234',
      icon: <FaCarCrash />,
      color: 'primary',
      change: '+12%',
      description: 'From last month'
    },
    {
      title: 'Fatal Accidents',
      value: stats?.fatal || '45',
      icon: <FaUserInjured />,
      color: 'danger',
      change: '-5%',
      description: 'From last month'
    },
    {
      title: 'Serious Injuries',
      value: stats?.serious || '128',
      icon: <FaAmbulance />,
      color: 'warning',
      change: '+8%',
      description: 'From last month'
    },
    {
      title: 'Response Time',
      value: '8.2 min',
      icon: <FaClock />,
      color: 'info',
      change: '-15%',
      description: 'Average response'
    },
    {
      title: 'High Risk Zones',
      value: '12',
      icon: <FaExclamationTriangle />,
      color: 'secondary',
      change: '+3',
      description: 'Identified zones'
    },
    {
      title: 'Prediction Accuracy',
      value: '92.5%',
      icon: <FaChartLine />,
      color: 'success',
      change: '+2.1%',
      description: 'Model performance'
    }
  ];

  return (
    <Row className="g-4">
      {cards.map((card, index) => (
        <Col key={index} xl={2} lg={4} md={6}>
          <div className={`stat-card stat-${card.color}`}>
            <div className="stat-header">
              <div className={`stat-icon bg-${card.color}`}>
                {card.icon}
              </div>
              <div className="stat-change">
                <span className={`change-${card.change.includes('+') ? 'positive' : 'negative'}`}>
                  {card.change}
                </span>
              </div>
            </div>
            <div className="stat-body mt-3">
              <h3 className="stat-value">{card.value}</h3>
              <h6 className="stat-label">{card.title}</h6>
              <small className="stat-description">{card.description}</small>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;