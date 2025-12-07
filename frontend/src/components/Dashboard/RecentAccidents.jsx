import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaCarCrash } from 'react-icons/fa';

const RecentAccidents = ({ hotspots = [] }) => {
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Fatal':
        return <Badge bg="danger">{severity}</Badge>;
      case 'Serious':
        return <Badge bg="warning" text="dark">{severity}</Badge>;
      case 'Slight':
        return <Badge bg="success">{severity}</Badge>;
      default:
        return <Badge bg="secondary">{severity}</Badge>;
    }
  };

  return (
    <Card className="pro-card">
      <Card.Header className="pro-card-header">
        <h5 className="pro-card-title mb-0">Recent Accidents</h5>
      </Card.Header>
      <Card.Body>
        <Table hover responsive className="pro-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Location</th>
              <th>Date</th>
              <th>Severity</th>
              <th>Weather</th>
              <th>Road Type</th>
            </tr>
          </thead>
          <tbody>
            {hotspots.length > 0 ? (
              hotspots.slice(0, 10).map((hotspot, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <FaMapMarkerAlt className="me-2 text-primary" />
                    {hotspot.latitude?.toFixed(4)}, {hotspot.longitude?.toFixed(4)}
                  </td>
                  <td>
                    <FaCalendarAlt className="me-2 text-info" />
                    {hotspot.date ? new Date(hotspot.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <FaCarCrash className="me-2" />
                    {getSeverityBadge(hotspot.severity)}
                  </td>
                  <td>{hotspot.weather || 'Unknown'}</td>
                  <td>{hotspot.road_type || 'Unknown'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  No accident data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default RecentAccidents;