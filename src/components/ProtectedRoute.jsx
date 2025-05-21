import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    if (Array.isArray(requiredRole)) {
      const hasAnyRole = requiredRole.some(role => hasRole(role));
      if (!hasAnyRole) return <Navigate to="/unauthorized" replace />;
    } else {
      if (!hasRole(requiredRole)) return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 