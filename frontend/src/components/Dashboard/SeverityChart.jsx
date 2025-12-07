import React from 'react';
import { Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FaChartPie } from 'react-icons/fa';

const SeverityChart = ({ severityDistribution }) => {
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
    <Card className="pro-card h-100">
      <Card.Header className="pro-card-header">
        <h5 className="pro-card-title mb-0">
          <FaChartPie className="me-2" />
          Severity Distribution
        </h5>
      </Card.Header>
      <Card.Body>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
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
        </div>
        
        <div className="mt-4">
          {data.map((item, index) => (
            <div key={index} className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                <div 
                  className="me-2"
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: item.color,
                    borderRadius: '50%'
                  }}
                ></div>
                <span>{item.name}</span>
              </div>
              <div>
                <strong>{item.value.toLocaleString()}</strong>
                <small className="text-muted ms-2">
                  ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
                </small>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default SeverityChart;