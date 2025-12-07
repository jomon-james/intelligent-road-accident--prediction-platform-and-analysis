import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Dashboard = ({ severityDistribution }) => {
  // Default data if no distribution provided
  const data = severityDistribution ? [
    { name: 'Slight', value: severityDistribution.Slight || 0, color: '#28a745' },
    { name: 'Serious', value: severityDistribution.Serious || 0, color: '#ffc107' },
    { name: 'Fatal', value: severityDistribution.Fatal || 0, color: '#dc3545' },
  ] : [
    { name: 'Slight', value: 700, color: '#28a745' },
    { name: 'Serious', value: 200, color: '#ffc107' },
    { name: 'Fatal', value: 100, color: '#dc3545' },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="dashboard-chart">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, 'Accidents']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      <Row className="mt-3 text-center">
        {data.map((item, index) => (
          <Col key={index} md={4}>
            <div className="mb-2">
              <div 
                className="mx-auto"
                style={{
                  width: '15px',
                  height: '15px',
                  backgroundColor: item.color,
                  borderRadius: '50%',
                  display: 'inline-block',
                  marginRight: '5px'
                }}
              ></div>
              <strong>{item.name}</strong>
            </div>
            <h5 className="mb-0">{item.value.toLocaleString()}</h5>
            <small className="text-muted">
              {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
            </small>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Dashboard;