import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import { 
  FaUser, FaEnvelope, FaLock, FaCalendarAlt, 
  FaHistory, FaChartLine, FaEdit, FaSave 
} from 'react-icons/fa';
import ProtectedRoute from '../components/Auth/ProtectedRoute';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    
    // Set form data from user
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      address: userData.address || '',
      city: userData.city || '',
      country: userData.country || ''
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update user data in localStorage
      const updatedUser = {
        ...user,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditMode(false);
      setMessage('Profile updated successfully!');
      setLoading(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  // Mock prediction history
  const predictionHistory = [
    { id: 1, date: '2024-01-15', severity: 'Serious', confidence: 85 },
    { id: 2, date: '2024-01-14', severity: 'Slight', confidence: 92 },
    { id: 3, date: '2024-01-13', severity: 'Fatal', confidence: 78 },
  ];

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="info">
          Please log in to view your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <ProtectedRoute>
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="page-header">
              <h1 className="page-title">
                <FaUser className="me-3" />
                User Profile
              </h1>
              <p className="page-subtitle">
                Manage your account information and preferences
              </p>
            </div>
          </Col>
        </Row>

        {message && (
          <Alert variant="success" className="mb-4">
            {message}
          </Alert>
        )}

        <Tabs defaultActiveKey="profile" className="mb-4 pro-tabs">
          <Tab eventKey="profile" title={
            <>
              <FaUser className="me-2" />
              Profile Information
            </>
          }>
            <Row className="mt-3">
              <Col lg={8}>
                <Card className="pro-card">
                  <Card.Header className="pro-card-header d-flex justify-content-between align-items-center">
                    <h5 className="pro-card-title mb-0">Personal Information</h5>
                    <Button 
                      variant={editMode ? "success" : "outline-primary"}
                      size="sm"
                      onClick={editMode ? handleSaveProfile : () => setEditMode(true)}
                      disabled={loading}
                    >
                      {editMode ? (
                        <>
                          <FaSave className="me-2" />
                          {loading ? 'Saving...' : 'Save Changes'}
                        </>
                      ) : (
                        <>
                          <FaEdit className="me-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            <FaUser className="me-2" />
                            Full Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!editMode}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            <FaEnvelope className="me-2" />
                            Email Address
                          </Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            readOnly
                          />
                          <Form.Text className="text-muted">
                            Email cannot be changed
                          </Form.Text>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="Enter phone number"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>City</Form.Label>
                          <Form.Control
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="Enter city"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="Enter address"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Country</Form.Label>
                          <Form.Control
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="Enter country"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="pro-card mb-4">
                  <Card.Header className="pro-card-header">
                    <h5 className="pro-card-title mb-0">Account Summary</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center mb-4">
                      <div className="avatar-lg bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                        style={{ width: '80px', height: '80px' }}>
                        <FaUser size={40} className="text-white" />
                      </div>
                      <h4>{user.name || 'User'}</h4>
                      <p className="text-muted">{user.email}</p>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role === 'admin' ? 'Administrator' : 'Regular User'}
                      </span>
                    </div>

                    <div className="account-stats">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Member Since</span>
                        <span className="text-muted">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Last Updated</span>
                        <span className="text-muted">
                          {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Account Status</span>
                        <span className="badge bg-success">Active</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="pro-card">
                  <Card.Header className="pro-card-header">
                    <h5 className="pro-card-title mb-0">Quick Actions</h5>
                  </Card.Header>
                  <Card.Body>
                    <Button variant="outline-primary" className="w-100 mb-2">
                      <FaLock className="me-2" />
                      Change Password
                    </Button>
                    <Button variant="outline-secondary" className="w-100 mb-2">
                      <FaHistory className="me-2" />
                      View History
                    </Button>
                    <Button variant="outline-info" className="w-100">
                      <FaChartLine className="me-2" />
                      View Statistics
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="history" title={
            <>
              <FaHistory className="me-2" />
              Prediction History
            </>
          }>
            <Card className="pro-card mt-3">
              <Card.Header className="pro-card-header">
                <h5 className="pro-card-title mb-0">Recent Predictions</h5>
              </Card.Header>
              <Card.Body>
                {predictionHistory.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Severity</th>
                          <th>Confidence</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictionHistory.map(pred => (
                          <tr key={pred.id}>
                            <td>
                              <FaCalendarAlt className="me-2 text-info" />
                              {pred.date}
                            </td>
                            <td>
                              <span className={`badge ${
                                pred.severity === 'Fatal' ? 'bg-danger' :
                                pred.severity === 'Serious' ? 'bg-warning' :
                                'bg-success'
                              }`}>
                                {pred.severity}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                                  <div 
                                    className="progress-bar" 
                                    style={{ width: `${pred.confidence}%` }}
                                  ></div>
                                </div>
                                <span>{pred.confidence}%</span>
                              </div>
                            </td>
                            <td>
                              <Button variant="outline-primary" size="sm">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Alert variant="info">
                    No prediction history available.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Container>
    </ProtectedRoute>
  );
};

export default Profile;