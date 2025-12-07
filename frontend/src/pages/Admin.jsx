import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Tabs, Tab, Badge, Button } from 'react-bootstrap';
import { 
  FaUsers, FaChartBar, FaHistory, FaCog, 
  FaBell, FaUserCheck, FaUserTimes, FaExclamationTriangle,
  FaEye, FaTrash, FaEdit
} from 'react-icons/fa';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import { api } from '../services/api';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [adminStats, userPredictions] = await Promise.all([
        api.getAdminStats(),
        api.getHotspots(50) // Using hotspots as mock predictions
      ]);
      
      setStats(adminStats);
      setPredictions(userPredictions);
      
      // Mock users data
      setUsers([
        { id: 1, name: 'John Admin', email: 'admin@example.com', role: 'admin', status: 'active', predictions: 24 },
        { id: 2, name: 'Jane User', email: 'jane@example.com', role: 'user', status: 'active', predictions: 15 },
        { id: 3, name: 'Bob Tester', email: 'bob@example.com', role: 'user', status: 'inactive', predictions: 8 },
        { id: 4, name: 'Alice Analyst', email: 'alice@example.com', role: 'user', status: 'active', predictions: 12 },
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = (userId, action) => {
    // Mock user action
    alert(`User ${userId}: ${action} action triggered`);
  };

  const handleDeletePrediction = (predictionId) => {
    if (window.confirm('Are you sure you want to delete this prediction?')) {
      setPredictions(predictions.filter(p => p.id !== predictionId));
    }
  };

  return (
    <ProtectedRoute role="admin">
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="page-header">
              <h1 className="page-title">
                <FaCog className="me-3" />
                Admin Dashboard
              </h1>
              <p className="page-subtitle">
                Manage users, monitor predictions, and configure system settings
              </p>
            </div>
          </Col>
        </Row>

        {/* Stats Overview */}
        <Row className="g-4 mb-4">
          <Col xl={3} lg={6}>
            <Card className="pro-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="admin-stat-icon bg-primary">
                    <FaUsers />
                  </div>
                  <div className="ms-3">
                    <h3 className="admin-stat-value">{stats.total_users || 0}</h3>
                    <p className="admin-stat-label">Total Users</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6}>
            <Card className="pro-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="admin-stat-icon bg-success">
                    <FaChartBar />
                  </div>
                  <div className="ms-3">
                    <h3 className="admin-stat-value">{stats.total_predictions || 0}</h3>
                    <p className="admin-stat-label">Total Predictions</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6}>
            <Card className="pro-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="admin-stat-icon bg-info">
                    <FaBell />
                  </div>
                  <div className="ms-3">
                    <h3 className="admin-stat-value">{stats.accuracy || 0}%</h3>
                    <p className="admin-stat-label">Model Accuracy</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6}>
            <Card className="pro-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="admin-stat-icon bg-warning">
                    <FaExclamationTriangle />
                  </div>
                  <div className="ms-3">
                    <h3 className="admin-stat-value">{stats.system_uptime || '0%'}</h3>
                    <p className="admin-stat-label">System Uptime</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Content Tabs */}
        <Tabs defaultActiveKey="users" className="pro-tabs mb-4">
          <Tab eventKey="users" title={
            <>
              <FaUsers className="me-2" />
              User Management
            </>
          }>
            <Card className="pro-card mt-3">
              <Card.Header className="pro-card-header">
                <h5 className="mb-0">Registered Users</h5>
              </Card.Header>
              <Card.Body>
                <Table hover responsive className="pro-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Predictions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-2">
                              <span className="text-white">{user.name.charAt(0)}</span>
                            </div>
                            {user.name}
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <Badge bg={user.role === 'admin' ? 'primary' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={user.status === 'active' ? 'success' : 'danger'}>
                            {user.status}
                          </Badge>
                        </td>
                        <td>
                          <strong>{user.predictions}</strong>
                        </td>
                        <td>
                          <div className="btn-group">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'view')}
                            >
                              <FaEye />
                            </Button>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              className="ms-1"
                              onClick={() => handleUserAction(user.id, 'edit')}
                            >
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              className="ms-1"
                              onClick={() => handleUserAction(user.id, 'delete')}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="predictions" title={
            <>
              <FaHistory className="me-2" />
              Prediction History
            </>
          }>
            <Card className="pro-card mt-3">
              <Card.Header className="pro-card-header">
                <h5 className="mb-0">Recent Predictions</h5>
              </Card.Header>
              <Card.Body>
                <Table hover responsive className="pro-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Severity</th>
                      <th>Location</th>
                      <th>Date</th>
                      <th>Weather</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.slice(0, 10).map(pred => (
                      <tr key={pred.id}>
                        <td>#{pred.id}</td>
                        <td>
                          <Badge className={`badge-${pred.severity.toLowerCase()}`}>
                            {pred.severity}
                          </Badge>
                        </td>
                        <td>
                          {pred.latitude.toFixed(4)}, {pred.longitude.toFixed(4)}
                        </td>
                        <td>{new Date(pred.date).toLocaleDateString()}</td>
                        <td>{pred.weather}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="me-1"
                          >
                            <FaEye />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeletePrediction(pred.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Container>
    </ProtectedRoute>
  );
};

export default Admin;