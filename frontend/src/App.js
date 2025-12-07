import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

// Components
import Header from './components/Header/Header';

// Pages
import Home from './pages/Home';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import Analysis from './pages/Analysis';
import Predict from './pages/Predict';  // This is the real Predict component
import Admin from './pages/Admin';
import Profile from './pages/Profile';

// Auth
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Mock pages for development (only for pages that don't exist yet)
const AdminPage = () => (
  <div className="container py-5">
    <h1>Admin Dashboard</h1>
    <p>Coming soon...</p>
  </div>
);

const ProfilePage = () => (
  <div className="container py-5">
    <h1>Profile</h1>
    <p>Coming soon...</p>
  </div>
);

const NotFoundPage = () => (
  <div className="container py-5 text-center">
    <h1 className="display-1">404</h1>
    <p className="lead">Page not found</p>
  </div>
);

function App() {
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <div className="App">
      {/* Show header only if user is logged in */}
      {user && <Header />}
      
      <div className={user ? "main-container" : ""}>
        <Routes>
          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <LoginPage />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/" /> : <SignupPage />} 
          />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          
          {/* Use the real Predict component, not PredictPage */}
          <Route 
            path="/predict" 
            element={
              <ProtectedRoute>
                <Predict />  {/* Changed from PredictPage to Predict */}
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/analysis" 
            element={
              <ProtectedRoute>
                <Analysis />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute role="admin">
                <Admin />  {/* Use real Admin if it exists, otherwise use mock */}
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />  {/* Use real Profile if it exists */}
              </ProtectedRoute>
            } 
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}

export default App;