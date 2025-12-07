import React from 'react';
import { Card } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaChartLine } from 'react-icons/fa';

const TimeAnalysis = ({ temporalData = [] }) => {
  // Use provided data or mock data
  const chartData = temporalData.length > 0 ? temporalData : [
    { period: 'Jan', slight: 120, serious: 45, fatal: 12 },
    { period: 'Feb', slight: 135, serious: 52, fatal: 15 },
    { period: 'Mar', slight: 142, serious: 48, fatal: 18 },
    { period: 'Apr', slight: 128, serious: 51, fatal: 14 },
    { period: 'May', slight: 155, serious: 58, fatal: 22 },
    { period: 'Jun', slight: 168, serious: 62, fatal: 25 },
  ];

  return (
    <Card className="pro-card">
      <Card.Header className="pro-card-header">
        <h5 className="pro-card-title mb-0">
          <FaChartLine className="me-2" />
          Accident Trends Over Time
        </h5>
      </Card.Header>
      <Card.Body>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="slight" stroke="#28a745" name="Slight" />
              <Line type="monotone" dataKey="serious" stroke="#ffc107" name="Serious" />
              <Line type="monotone" dataKey="fatal" stroke="#dc3545" name="Fatal" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TimeAnalysis;