import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard if they try to access unauthorized routes
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/customer" replace />;
  }

  return <Outlet />;
};
