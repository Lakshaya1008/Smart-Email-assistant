import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { getStoredToken, removeStoredToken } from '../utils/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getStoredToken();
        if (token) {
          // Test if token is still valid
          await authService.testAuth();
          // If test passes, get user info from token payload
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            username: payload.sub,
            token: token
          });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        removeStoredToken();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        token: response.token
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        token: response.token
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };