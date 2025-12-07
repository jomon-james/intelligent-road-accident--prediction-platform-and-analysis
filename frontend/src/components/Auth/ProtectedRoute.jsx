import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role = 'user' }) => {
  // Check if user is logged in
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Check token expiration (mock check)
    if (!user.token || !user.email) {
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }

    // Check role if required
    if (role === 'admin' && user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;