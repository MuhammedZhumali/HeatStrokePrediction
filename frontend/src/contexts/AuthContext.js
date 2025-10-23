import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simple initialization - no token checking
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Starting login process...');
      const response = await loginUser(credentials);
      console.log('AuthContext: Login response:', response);
      
      // Use role from backend response
      const userData = {
        id: 1,
        name: response.user?.username || credentials.email,
        email: credentials.email,
        role: response.user?.role || 'PATIENT',
        roleType: response.user?.role || 'PATIENT'
      };
      
      console.log('AuthContext: Setting user:', userData);
      setUser(userData);
      
      console.log('AuthContext: Login successful');
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out...');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
