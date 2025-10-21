import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import RiskPredictionForm from './components/RiskPredictionForm';
import PredictionHistory from './components/PredictionHistory';
import UserManagement from './components/admin/UserManagement';
import Navigation from './components/Navigation';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/predict" element={
            <ProtectedRoute>
              <RiskPredictionForm />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <PredictionHistory />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requireAdmin={true}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

