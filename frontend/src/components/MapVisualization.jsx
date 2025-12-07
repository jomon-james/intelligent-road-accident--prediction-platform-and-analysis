import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { FaMapMarkerAlt, FaCarCrash } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons for different severity levels
const createSeverityIcon = (severity) => {
  let color;
  switch (severity) {
    case 'Fatal':
      color = '#dc3545';
      break;
    case 'Serious':
      color = '#ffc107';
      break;
    case 'Slight':
      color = '#28a745';
      break;
    default:
      color = '#6c757d';
  }

  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
    ">
      <i class="fas fa-car-crash"></i>
    </div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const MapVisualization = ({ hotspots = [] }) => {
  // Default center (London)
  const defaultCenter = [51.5074, -0.1278];
  const defaultZoom = 10;

  // Calculate bounds if we have hotspots
  let bounds = null;
  if (hotspots.length > 0) {
    const lats = hotspots.map(h => h.latitude);
    const lngs = hotspots.map(h => h.longitude);
    bounds = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ];
  }

  // Group hotspots by location for clustering
  const groupedHotspots = {};
  hotspots.forEach(hotspot => {
    const key = `${hotspot.latitude.toFixed(3)},${hotspot.longitude.toFixed(3)}`;
    if (!groupedHotspots[key]) {
      groupedHotspots[key] = {
        ...hotspot,
        count: 1,
        severities: [hotspot.severity]
      };
    } else {
      groupedHotspots[key].count += 1;
      if (!groupedHotspots[key].severities.includes(hotspot.severity)) {
        groupedHotspots[key].severities.push(hotspot.severity);
      }
    }
  });

  const groupedHotspotsArray = Object.values(groupedHotspots);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Fatal': return '#dc3545';
      case 'Serious': return '#ffc107';
      case 'Slight': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getCircleRadius = (count) => {
    return Math.min(Math.sqrt(count) * 2000, 20000);
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        bounds={bounds}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Add heatmap-like circles for accident density */}
        {groupedHotspotsArray.map((hotspot, index) => {
          const mostSevere = hotspot.severities.includes('Fatal') ? 'Fatal' :
                            hotspot.severities.includes('Serious') ? 'Serious' : 'Slight';
          
          return (
            <Circle
              key={index}
              center={[hotspot.latitude, hotspot.longitude]}
              radius={getCircleRadius(hotspot.count)}
              pathOptions={{
                fillColor: getSeverityColor(mostSevere),
                color: getSeverityColor(mostSevere),
                fillOpacity: 0.2,
                weight: 1
              }}
            >
              <Popup>
                <div>
                  <h6>
                    <FaMapMarkerAlt className="me-2" />
                    Accident Hotspot
                  </h6>
                  <p className="mb-1">
                    <strong>Location:</strong> {hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}
                  </p>
                  <p className="mb-1">
                    <strong>Total Accidents:</strong> {hotspot.count}
                  </p>
                  <p className="mb-1">
                    <strong>Severities:</strong> {hotspot.severities.join(', ')}
                  </p>
                  {hotspot.date && (
                    <p className="mb-1">
                      <strong>Date:</strong> {new Date(hotspot.date).toLocaleDateString()}
                    </p>
                  )}
                  {hotspot.weather && (
                    <p className="mb-0">
                      <strong>Weather:</strong> {hotspot.weather}
                    </p>
                  )}
                </div>
              </Popup>
            </Circle>
          );
        })}
        
        {/* Add markers for individual accidents */}
        {hotspots.slice(0, 100).map((hotspot, index) => (
          <Marker
            key={index}
            position={[hotspot.latitude, hotspot.longitude]}
            icon={createSeverityIcon(hotspot.severity)}
          >
            <Popup>
              <div>
                <h6>
                  <FaCarCrash className="me-2" />
                  {hotspot.severity} Accident
                </h6>
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
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-title">Severity Legend</div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#dc3545' }}></span>
          <span className="legend-label">Fatal</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ffc107' }}></span>
          <span className="legend-label">Serious</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#28a745' }}></span>
          <span className="legend-label">Slight</span>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization;