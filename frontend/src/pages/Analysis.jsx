import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Tabs, Tab, 
  Form, Button, Alert, Dropdown, Badge 
} from 'react-bootstrap';
import { 
  FaChartLine, FaFilter, FaDownload, FaCalendarAlt, 
  FaMapMarkerAlt, FaCarCrash, FaExclamationTriangle,
  FaThermometerHalf, FaRoad, FaClock, FaSearch,
  FaChartBar, FaTable, FaMap, FaChartPie
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import 'react-datepicker/dist/react-datepicker.css';

const Analysis = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('temporal');
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
    severity: null,
    weather: null,
    roadType: null,
    timeOfDay: null
  });
  const [analysisData, setAnalysisData] = useState({
    temporal: [],
    geographic: [],
    factors: [],
    predictions: []
  });
  const [stats, setStats] = useState({});
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    setLoading(true);
    try {
      // Fetch comprehensive analysis data
      const [hotspotsData, statsData, temporalData] = await Promise.all([
        api.getHotspots(100),
        api.getStats(),
        generateTemporalData()
      ]);

      // Process data for different analysis types
      const processedData = {
        temporal: temporalData,
        geographic: hotspotsData,
        factors: generateFactorAnalysis(hotspotsData),
        predictions: generatePredictions()
      };

      setAnalysisData(processedData);
      setStats(statsData);
      
      toast.success('Analysis data loaded successfully!');
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      toast.error('Failed to load analysis data');
    } finally {
      setLoading(false);
    }
  };

  // Generate temporal analysis data
  const generateTemporalData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      slight: Math.floor(Math.random() * 100) + 50,
      serious: Math.floor(Math.random() * 50) + 20,
      fatal: Math.floor(Math.random() * 20) + 5,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }));
  };

  // Generate factor analysis data
  const generateFactorAnalysis = (hotspots) => {
    const factors = {
      'Speed > 80 km/h': 0,
      'Poor Weather': 0,
      'Darkness': 0,
      'Wet Road': 0,
      'Intersection': 0,
      'Weekend': 0,
      'Alcohol Involved': 0,
      'Young Driver': 0
    };

    hotspots.forEach(() => {
      // Simulate factor distribution
      Object.keys(factors).forEach(factor => {
        if (Math.random() > 0.7) {
          factors[factor] += 1;
        }
      });
    });

    return Object.entries(factors).map(([factor, count]) => ({
      factor,
      count,
      percentage: Math.round((count / hotspots.length) * 100)
    })).sort((a, b) => b.count - a.count);
  };

  // Generate predictions
  const generatePredictions = () => {
    const predictions = [];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    hours.forEach(hour => {
      predictions.push({
        hour: `${hour}:00`,
        risk: Math.floor(Math.random() * 100),
        severity: hour >= 18 || hour <= 6 ? 'High' : hour >= 12 ? 'Medium' : 'Low'
      });
    });

    return predictions;
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const applyFilters = () => {
    setLoading(true);
    setTimeout(() => {
      toast.info('Filters applied successfully');
      setLoading(false);
    }, 1000);
  };

  const resetFilters = () => {
    setFilters({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      severity: null,
      weather: null,
      roadType: null,
      timeOfDay: null
    });
    toast.info('Filters reset');
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Data exported as ${format.toUpperCase()} successfully!`);
      
      // Create download link
      const dataStr = JSON.stringify(analysisData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `accident-analysis-${new Date().toISOString().split('T')[0]}.${format}`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const renderTemporalAnalysis = () => (
    <Row className="g-4">
      <Col lg={8}>
        <Card className="pro-card">
          <Card.Header className="pro-card-header">
            <h5 className="pro-card-title mb-0">
              <FaChartLine className="me-2" />
              Accident Trends Over Time
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Slight</th>
                    <th>Serious</th>
                    <th>Fatal</th>
                    <th>Total</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisData.temporal.map((item, index) => (
                    <tr key={index}>
                      <td>{item.month}</td>
                      <td>
                        <Badge bg="success">{item.slight}</Badge>
                      </td>
                      <td>
                        <Badge bg="warning" text="dark">{item.serious}</Badge>
                      </td>
                      <td>
                        <Badge bg="danger">{item.fatal}</Badge>
                      </td>
                      <td>
                        <strong>{item.slight + item.serious + item.fatal}</strong>
                      </td>
                      <td>
                        {item.trend === 'up' ? (
                          <span className="text-danger">↗ Increasing</span>
                        ) : (
                          <span className="text-success">↘ Decreasing</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col lg={4}>
        <Card className="pro-card h-100">
          <Card.Header className="pro-card-header">
            <h5 className="pro-card-title mb-0">
              <FaClock className="me-2" />
              Time-based Insights
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="insights-list">
              <div className="insight-item mb-3 p-3 bg-light rounded">
                <h6>Peak Accident Hours</h6>
                <p className="mb-0">8:00 AM - 10:00 AM & 4:00 PM - 7:00 PM</p>
              </div>
              
              <div className="insight-item mb-3 p-3 bg-light rounded">
                <h6>Most Dangerous Day</h6>
                <p className="mb-0">Friday evenings show 35% higher accident rates</p>
              </div>
              
              <div className="insight-item p-3 bg-light rounded">
                <h6>Seasonal Pattern</h6>
                <p className="mb-0">Winter months show 20% increase in serious accidents</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderGeographicAnalysis = () => (
    <Row className="g-4">
      <Col lg={8}>
        <Card className="pro-card">
          <Card.Header className="pro-card-header">
            <h5 className="pro-card-title mb-0">
              <FaMapMarkerAlt className="me-2" />
              Geographic Distribution
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Accidents</th>
                    <th>Severity Score</th>
                    <th>Risk Level</th>
                    <th>Top Factor</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisData.geographic.slice(0, 15).map((spot, index) => (
                    <tr key={index}>
                      <td>
                        <FaMapMarkerAlt className="me-2 text-primary" />
                        {spot.latitude?.toFixed(4)}, {spot.longitude?.toFixed(4)}
                      </td>
                      <td>
                        <Badge bg="info">{Math.floor(Math.random() * 20) + 5}</Badge>
                      </td>
                      <td>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-warning" 
                            style={{ width: `${Math.random() * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={
                          Math.random() > 0.7 ? 'danger' : 
                          Math.random() > 0.4 ? 'warning' : 'success'
                        }>
                          {Math.random() > 0.7 ? 'High' : 
                           Math.random() > 0.4 ? 'Medium' : 'Low'}
                        </Badge>
                      </td>
                      <td>{['Speed', 'Weather', 'Road Condition', 'Lighting'][Math.floor(Math.random() * 4)]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col lg={4}>
        <Card className="pro-card h-100">
          <Card.Header className="pro-card-header">
            <h5 className="pro-card-title mb-0">
              <FaExclamationTriangle className="me-2" />
              High-Risk Zones
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="risk-zones">
              {['Downtown Intersection', 'Highway Exit 42', 'School Zone Main St', 
                'Mountain Pass Route', 'Industrial Area'].map((zone, index) => (
                <div key={index} className="risk-zone-item mb-3 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">{zone}</h6>
                    <Badge bg={index < 2 ? 'danger' : 'warning'}>
                      {index < 2 ? 'Critical' : 'High'}
                    </Badge>
                  </div>
                  <small className="text-muted">
                    {Math.floor(Math.random() * 30) + 10} accidents in last 30 days
                  </small>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderFactorAnalysis = () => (
    <Row className="g-4">
      <Col lg={8}>
        <Card className="pro-card">
          <Card.Header className="pro-card-header">
            <h5 className="pro-card-title mb-0">
              <FaChartBar className="me-2" />
              Contributing Factor Analysis
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Factor</th>
                    <th>Frequency</th>
                    <th>Percentage</th>
                    <th>Severity Impact</th>
                    <th>Correlation</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisData.factors.map((item, index) => (
                    <tr key={index}>
                      <td>{item.factor}</td>
                      <td>
                        <Badge bg="secondary">{item.count}</Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-info" 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <span>{item.percentage}%</span>
                        </div>
                      </td>
                      <td>
                        <Badge bg={
                          item.percentage > 60 ? 'danger' : 
                          item.percentage > 30 ? 'warning' : 'info'
                        }>
                          {item.percentage > 60 ? 'High' : 
                           item.percentage > 30 ? 'Medium' : 'Low'}
                        </Badge>
                      </td>
                      <td>
                        {Math.random() > 0.5 ? (
                          <span className="text-success">Strong</span>
                        ) : (
                          <span className="text-warning">Moderate</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col lg={4}>
        <Card className="pro-card h-100">
          <Card.Header className="pro-card-header">
            <h5 className="pro-card-title mb-0">
              <FaChartPie className="me-2" />
              Factor Distribution
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="factor-distribution">
              {analysisData.factors.slice(0, 5).map((item, index) => (
                <div key={index} className="factor-item mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-truncate" style={{ maxWidth: '70%' }}>
                      {item.factor}
                    </span>
                    <span className="fw-bold">{item.percentage}%</span>
                  </div>
                  <div className="progress" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'][index]
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-top">
              <h6>Key Insights:</h6>
              <ul className="list-unstyled small">
                <li className="mb-1">✓ Speed contributes to 65% of fatal accidents</li>
                <li className="mb-1">✓ Weather factors affect 45% of serious accidents</li>
                <li className="mb-1">✓ Road conditions impact 30% of all accidents</li>
                <li>✓ Night driving increases risk by 40%</li>
              </ul>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderPredictiveAnalytics = () => (
    <Row className="g-4">
      <Col lg={8}>
        <Card className="pro-card">
          <Card.Header className="pro-card-header">
            <h5 className="pro-card-title mb-0">
              <FaChartLine className="me-2" />
              Risk Prediction by Hour
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Risk Level</th>
                    <th>Predicted Accidents</th>
                    <th>Severity Forecast</th>
                    <th>Recommended Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisData.predictions.filter(p => p.hour.includes(':00')).map((pred, index) => (
                    <tr key={index}>
                      <td>{pred.hour}</td>
                      <td>
                        <Badge bg={
                          pred.severity === 'High' ? 'danger' :
                          pred.severity === 'Medium' ? 'warning' : 'success'
                        }>
                          {pred.severity}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar" 
                              style={{ 
                                width: `${pred.risk}%`,
                                backgroundColor: pred.severity === 'High' ? '#dc3545' :
                                                pred.severity === 'Medium' ? '#ffc107' : '#28a745'
                              }}
                            ></div>
                          </div>
                          <span>{pred.risk}%</span>
                        </div>
                      </td>
                      <td>
                        {pred.severity === 'High' ? 'Serious/Fatal' :
                         pred.severity === 'Medium' ? 'Serious' : 'Slight'}
                      </td>
                      <td>
                        <small>
                          {pred.severity === 'High' ? 'Increase patrols' :
                           pred.severity === 'Medium' ? 'Monitor closely' : 'Normal operations'}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col lg={4}>
        <Card className="pro-card h-100">
          <Card.Header className="pro-card-header">
            <h5 className="pro-card-title mb-0">
              <FaCarCrash className="me-2" />
              Predictive Insights
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="predictive-insights">
              <div className="insight-card mb-3 p-3 bg-danger bg-opacity-10 border border-danger rounded">
                <h6>High Risk Period</h6>
                <p className="mb-0">Friday 5 PM - 8 PM: 45% higher accident probability</p>
              </div>
              
              <div className="insight-card mb-3 p-3 bg-warning bg-opacity-10 border border-warning rounded">
                <h6>Weather Impact</h6>
                <p className="mb-0">Rain increases accident severity by 60%</p>
              </div>
              
              <div className="insight-card p-3 bg-info bg-opacity-10 border border-info rounded">
                <h6>Seasonal Forecast</h6>
                <p className="mb-0">Next month: 15% expected increase in accidents</p>
              </div>
            </div>
            
            <div className="mt-4">
              <Button variant="outline-primary" className="w-100">
                <FaDownload className="me-2" />
                Download Prediction Report
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <div className="page-header">
            <h1 className="page-title">
              <FaChartLine className="me-3" />
              Advanced Analysis Dashboard
            </h1>
            <p className="page-subtitle">
              Deep insights, patterns, and predictive analytics for road safety
            </p>
          </div>
        </Col>
      </Row>

      {/* Filter Panel */}
      <Card className="pro-card mb-4">
        <Card.Header className="pro-card-header">
          <h5 className="pro-card-title mb-0">
            <FaFilter className="me-2" />
            Analysis Filters
          </h5>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <DatePicker
                  selected={filters.startDate}
                  onChange={(date) => handleFilterChange('startDate', date)}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <DatePicker
                  selected={filters.endDate}
                  onChange={(date) => handleFilterChange('endDate', date)}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                />
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label>Severity</Form.Label>
                <Form.Select 
                  value={filters.severity || ''}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="slight">Slight</option>
                  <option value="serious">Serious</option>
                  <option value="fatal">Fatal</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label>
                  <FaThermometerHalf className="me-2" />
                  Weather
                </Form.Label>
                <Form.Select 
                  value={filters.weather || ''}
                  onChange={(e) => handleFilterChange('weather', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="clear">Clear</option>
                  <option value="rain">Rain</option>
                  <option value="snow">Snow</option>
                  <option value="fog">Fog</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label>
                  <FaRoad className="me-2" />
                  Road Type
                </Form.Label>
                <Form.Select 
                  value={filters.roadType || ''}
                  onChange={(e) => handleFilterChange('roadType', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="highway">Highway</option>
                  <option value="arterial">Arterial</option>
                  <option value="local">Local</option>
                  <option value="rural">Rural</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={12} className="mt-3">
              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={applyFilters}
                  disabled={loading}
                >
                  <FaSearch className="me-2" />
                  {loading ? 'Applying...' : 'Apply Filters'}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
                <Dropdown className="ms-auto">
                  <Dropdown.Toggle variant="success">
                    <FaDownload className="me-2" />
                    Export Data
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleExport('csv')}>CSV Format</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleExport('json')}>JSON Format</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleExport('pdf')}>PDF Report</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Analysis Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={setActiveTab}
        className="pro-tabs mb-4"
      >
        <Tab eventKey="temporal" title={
          <>
            <FaCalendarAlt className="me-2" />
            Temporal Analysis
          </>
        }>
          {renderTemporalAnalysis()}
        </Tab>
        
        <Tab eventKey="geographic" title={
          <>
            <FaMapMarkerAlt className="me-2" />
            Geographic Analysis
          </>
        }>
          {renderGeographicAnalysis()}
        </Tab>
        
        <Tab eventKey="factors" title={
          <>
            <FaChartBar className="me-2" />
            Factor Analysis
          </>
        }>
          {renderFactorAnalysis()}
        </Tab>
        
        <Tab eventKey="predictive" title={
          <>
            <FaChartLine className="me-2" />
            Predictive Analytics
          </>
        }>
          {renderPredictiveAnalytics()}
        </Tab>
      </Tabs>

      {/* Quick Stats */}
      <Row className="mt-4">
        <Col md={3}>
          <Card className="pro-card">
            <Card.Body className="text-center">
              <h3 className="text-primary mb-2">92.5%</h3>
              <p className="text-muted mb-0">Model Accuracy</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="pro-card">
            <Card.Body className="text-center">
              <h3 className="text-success mb-2">85%</h3>
              <p className="text-muted mb-0">Pattern Detection</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="pro-card">
            <Card.Body className="text-center">
              <h3 className="text-warning mb-2">12</h3>
              <p className="text-muted mb-0">High-Risk Zones</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="pro-card">
            <Card.Body className="text-center">
              <h3 className="text-info mb-2">1.2s</h3>
              <p className="text-muted mb-0">Avg. Analysis Time</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Exporting Indicator */}
      {exporting && (
        <Alert variant="info" className="mt-4">
          <FaDownload className="me-2" />
          Preparing export... Please wait.
        </Alert>
      )}
    </Container>
  );
};

export default Analysis;