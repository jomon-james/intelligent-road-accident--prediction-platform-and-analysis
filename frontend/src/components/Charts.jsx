import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';  // ADD THIS IMPORT
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Charts = ({ temporalData = [] }) => {
  // Transform data for charts
  const lineData = temporalData.slice(-12) || []; // Last 12 periods
  
  // Sample bar chart data for accident factors
  const barData = [
    { name: 'Speed > 80', value: 45 },
    { name: 'Bad Weather', value: 32 },
    { name: 'Darkness', value: 28 },
    { name: 'Wet Roads', value: 24 },
    { name: 'Junctions', value: 19 },
  ];

  // If no data, use mock data
  const chartData = lineData.length > 0 ? lineData : [
    { period: 'Jan', slight: 120, serious: 45, fatal: 12 },
    { period: 'Feb', slight: 135, serious: 52, fatal: 15 },
    { period: 'Mar', slight: 142, serious: 48, fatal: 18 },
    { period: 'Apr', slight: 128, serious: 51, fatal: 14 },
    { period: 'May', slight: 155, serious: 58, fatal: 22 },
    { period: 'Jun', slight: 168, serious: 62, fatal: 25 },
  ];

  return (
    <div className="charts-container">
      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Accident Trends Over Time</h5>
            </Card.Header>
            <Card.Body style={{ height: '400px' }}>
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
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Top Contributing Factors</h5>
            </Card.Header>
            <Card.Body style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#667eea" name="Accidents" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Charts;