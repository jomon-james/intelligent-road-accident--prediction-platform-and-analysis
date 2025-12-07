import React from 'react';
import { Card } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { FaMapMarkerAlt } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const HotspotMap = ({ hotspots = [] }) => {
  const defaultCenter = [51.5074, -0.1278];
  const defaultZoom = 10;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Fatal': return '#dc3545';
      case 'Serious': return '#ffc107';
      case 'Slight': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <Card className="pro-card h-100">
      <Card.Header className="pro-card-header">
        <h5 className="pro-card-title mb-0">
          <FaMapMarkerAlt className="me-2" />
          Accident Hotspots
        </h5>
      </Card.Header>
      <Card.Body style={{ height: '500px', padding: 0 }}>
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {hotspots.map((hotspot, index) => (
            <Circle
              key={index}
              center={[hotspot.latitude, hotspot.longitude]}
              radius={1000}
              pathOptions={{
                fillColor: getSeverityColor(hotspot.severity),
                color: getSeverityColor(hotspot.severity),
                fillOpacity: 0.3,
                weight: 2
              }}
            >
              <Popup>
                <div>
                  <h6>{hotspot.severity} Accident</h6>
                  <p className="mb-1">
                    <strong>Location:</strong> {hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}
                  </p>
                  {hotspot.date && (
                    <p className="mb-1">
                      <strong>Date:</strong> {new Date(hotspot.date).toLocaleDateString()}
                    </p>
                  )}
                  {hotspot.weather && (
                    <p className="mb-1">
                      <strong>Weather:</strong> {hotspot.weather}
                    </p>
                  )}
                  {hotspot.road_type && (
                    <p className="mb-0">
                      <strong>Road Type:</strong> {hotspot.road_type}
                    </p>
                  )}
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </Card.Body>
    </Card>
  );
};

export default HotspotMap;