// Mock API service for development
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:8000/api';
  }

  // Mock data for development
  mockPredictions = [
    {
      id: 1,
      severity: 'Fatal',
      confidence: 92.5,
      factors: {
        'High Speed': 0.35,
        'Darkness': 0.28,
        'Wet Road': 0.22,
        'No Seatbelt': 0.15
      },
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      severity: 'Serious',
      confidence: 78.3,
      factors: {
        'Moderate Speed': 0.30,
        'Rain': 0.25,
        'Intersection': 0.20,
        'Young Driver': 0.25
      },
      timestamp: new Date().toISOString()
    },
    {
      id: 3,
      severity: 'Slight',
      confidence: 85.7,
      factors: {
        'Low Speed': 0.40,
        'Daylight': 0.30,
        'Dry Road': 0.20,
        'Experienced Driver': 0.10
      },
      timestamp: new Date().toISOString()
    }
  ];

  mockStats = {
    total_accidents: 1256,
    fatal: 89,
    serious: 342,
    slight: 825,
    accuracy: 92.5,
    response_time: '0.8s'
  };

  // Mock login
  async login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const isAdmin = email.includes('admin') || email === 'admin@example.com';
          resolve({
            success: true,
            user: {
              id: 1,
              name: email.split('@')[0],
              email,
              role: isAdmin ? 'admin' : 'user',
              token: 'mock-jwt-token-' + Date.now()
            }
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  // Mock signup
  async signup(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.email && userData.password) {
          resolve({
            success: true,
            user: {
              id: Date.now(),
              ...userData,
              token: 'mock-jwt-token-' + Date.now()
            }
          });
        } else {
          reject(new Error('Missing required fields'));
        }
      }, 1500);
    });
  }

  // Mock prediction
  async predict(conditions) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Randomly select a prediction for demo
        const randomPred = this.mockPredictions[
          Math.floor(Math.random() * this.mockPredictions.length)
        ];
        
        resolve({
          ...randomPred,
          conditions,
          needs_review: randomPred.confidence < 80,
          recommendation: this.getRecommendation(randomPred.severity)
        });
      }, 2000);
    });
  }

  getRecommendation(severity) {
    const recommendations = {
      Fatal: 'Immediate emergency response required. Contact EMS and police immediately.',
      Serious: 'Medical attention required. Secure the area and call emergency services.',
      Slight: 'Minor injuries. Exchange information and file a police report.'
    };
    return recommendations[severity] || 'Proceed with caution.';
  }

  // Mock stats
  async getStats() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.mockStats);
      }, 500);
    });
  }

  // Mock hotspots
  async getHotspots(limit = 20) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hotspots = Array.from({ length: limit }, (_, i) => ({
          id: i + 1,
          latitude: 51.5074 + (Math.random() - 0.5) * 0.1,
          longitude: -0.1278 + (Math.random() - 0.5) * 0.1,
          severity: ['Fatal', 'Serious', 'Slight'][Math.floor(Math.random() * 3)],
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          weather: ['Clear', 'Rain', 'Fog'][Math.floor(Math.random() * 3)],
          road_type: ['Highway', 'Arterial', 'Local'][Math.floor(Math.random() * 3)]
        }));
        resolve(hotspots);
      }, 800);
    });
  }

  // Mock admin data
  async getAdminStats() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          total_users: 156,
          active_users: 128,
          total_predictions: 2345,
          accuracy: 92.5,
          avg_response_time: '0.8s',
          system_uptime: '99.9%'
        });
      }, 500);
    });
  }
}

// Export singleton instance
export const api = new ApiService();
export default api;