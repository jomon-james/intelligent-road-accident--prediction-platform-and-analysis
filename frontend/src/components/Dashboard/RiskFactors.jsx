import React from 'react';
import { Card } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaExclamationTriangle } from 'react-icons/fa';

const RiskFactors = () => {
  const riskData = [
    { factor: 'High Speed', risk: 85 },
    { factor: 'Darkness', risk: 72 },
    { factor: 'Wet Roads', risk: 68 },
    { factor: 'Intersections', risk: 64 },
    { factor: 'Young Drivers', risk: 58 },
    { factor: 'Weekend Nights', risk: 52 },
    { factor: 'Rural Roads', risk: 48 },
    { factor: 'Bad Weather', risk: 45 },
  ];

  return (
    <Card className="pro-card">
      <Card.Header className="pro-card-header">
        <h5 className="pro-card-title mb-0">
          <FaExclamationTriangle className="me-2" />
          Top Risk Factors
        </h5>
      </Card.Header>
      <Card.Body>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={riskData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="factor" />
              <Tooltip formatter={(value) => [`${value}%`, 'Risk Level']} />
              <Bar dataKey="risk" fill="#667eea" name="Risk Level" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RiskFactors;