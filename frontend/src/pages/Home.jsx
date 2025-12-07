import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { FaChartBar, FaExclamationTriangle } from 'react-icons/fa';

// Import new components
import StatsCards from '../components/Dashboard/StatsCards';
import SeverityChart from '../components/Dashboard/SeverityChart';
import HotspotMap from '../components/Dashboard/HotspotMap';
import RecentAccidents from '../components/Dashboard/RecentAccidents';
import TimeAnalysis from '../components/Dashboard/TimeAnalysis';
import RiskFactors from '../components/Dashboard/RiskFactors';

// Import services
import { api } from '../services/api';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [temporalData, setTemporalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsData, hotspotsData] = await Promise.all([
        api.getStats(),
        api.getHotspots(50)
      ]);
      
      setStats(statsData);
      setHotspots(hotspotsData);
      
      // Generate temporal data from hotspots
      const temporal = generateTemporalData(hotspotsData);
      setTemporalData(temporal);
      
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data. Using mock data for demonstration.');
      console.error(err);
      
      // Set mock data on error
      setStats({
        total: 1256,
        fatal: 89,
        serious: 342,
        slight: 825,
        accuracy: 92.5,
        response_time: '0.8s'
      });
      
      setHotspots(generateMockHotspots(50));
      setTemporalData(generateMockTemporalData());
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for mock data
  const generateMockHotspots = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      latitude: 51.5074 + (Math.random() - 0.5) * 0.1,
      longitude: -0.1278 + (Math.random() - 0.5) * 0.1,
      severity: ['Slight', 'Serious', 'Fatal'][Math.floor(Math.random() * 3)],
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      weather: ['Clear', 'Rain', 'Fog', 'Snow'][Math.floor(Math.random() * 4)],
      road_type: ['Highway', 'Arterial', 'Local', 'Rural'][Math.floor(Math.random() * 4)]
    }));
  };

  const generateTemporalData = (hotspots) => {
    const monthlyData = {};
    
    hotspots.forEach(hotspot => {
      const date = new Date(hotspot.date);
      const month = date.toLocaleString('default', { month: 'short' });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { slight: 0, serious: 0, fatal: 0 };
      }
      
      monthlyData[month][hotspot.severity.toLowerCase()] += 1;
    });
    
    return Object.entries(monthlyData).map(([period, data]) => ({
      period,
      ...data
    }));
  };

  const generateMockTemporalData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      period: month,
      slight: Math.floor(Math.random() * 100) + 100,
      serious: Math.floor(Math.random() * 50) + 30,
      fatal: Math.floor(Math.random() * 20) + 5
    }));
  };

  if (loading) {
    return (
      <Container fluid className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <div className="page-header">
            <h1 className="page-title">
              <FaChartBar className="me-3" />
              Dashboard Overview
            </h1>
            <p className="page-subtitle">
              Real-time insights and analysis of road accident data
            </p>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="warning" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col>
          <StatsCards stats={stats} />
        </Col>
      </Row>

      {/* Main Dashboard Content */}
      <Row className="g-4 mb-4">
        {/* Left Column */}
        <Col xl={8} lg={7}>
          <Row className="g-4">
            <Col md={12}>
              <HotspotMap hotspots={hotspots} />
            </Col>
            <Col md={12}>
              <TimeAnalysis temporalData={temporalData} />
            </Col>
          </Row>
        </Col>

        {/* Right Column */}
        <Col xl={4} lg={5}>
          <Row className="g-4">
            <Col md={12}>
              <SeverityChart severityDistribution={stats} />
            </Col>
            <Col md={12}>
              <RiskFactors />
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Recent Accidents Table */}
      <Row className="mb-4">
        <Col>
          <RecentAccidents hotspots={hotspots} />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;