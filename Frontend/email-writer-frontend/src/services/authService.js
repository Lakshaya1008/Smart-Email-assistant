import { apiService } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { setStoredToken } from '../utils/storage';

class AuthService {
  // User login
  async login(credentials) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.AUTH.LOGIN, 
        credentials,
        { includeAuth: false }
      );
      
      // Store token
      if (response.token) {
        setStoredToken(response.token);
      }
      
      return response;
    } catch (error) {
      throw new Error(error.data?.reason || error.message || 'Login failed');
    }
  }

  // User registration
  async register(userData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.AUTH.REGISTER, 
        userData,
        { includeAuth: false }
      );
      
      // Store token
      if (response.token) {
        setStoredToken(response.token);
      }
      
      return response;
    } catch (error) {
      throw new Error(error.data?.reason || error.message || 'Registration failed');
    }
  }

  // Test authentication
  async testAuth() {
    try {
      return await apiService.get(API_ENDPOINTS.AUTH.TEST);
    } catch (error) {
      throw new Error('Authentication test failed');
    }
  }
}

export const authService = new AuthService();