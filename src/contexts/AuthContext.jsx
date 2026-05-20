/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
    return (token && storedUser) ? JSON.parse(storedUser) : null;
  });

  /**
   * Login — any role (Admin, Staff, Customer)
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast.success(response.data.message || 'Login successful');
        return userData;
      }
      return null;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  /**
   * Register — customer self-registration only
   */
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        const { token, ...newUserData } = response.data.data;
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(newUserData));
        setUser(newUserData);
        toast.success(response.data.message || 'Registration successful');
        return newUserData;
      }
      return null;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  /**
   * Change password — self-service (requires current password)
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
      throw error;
    }
  };

  /**
   * Logout — clear session
   */
  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  /**
   * Update profile in local state after a successful profile update API call
   */
  const updateProfile = async (updates) => {
    try {
      await api.put('/customers/profile', updates);
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, changePassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
