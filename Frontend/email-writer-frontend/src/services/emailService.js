import { apiService } from './api';
import { API_ENDPOINTS } from '../utils/constants';

class EmailService {
  // Generate multiple email replies
  async generateReplies(emailData) {
    try {
      return await apiService.post(API_ENDPOINTS.EMAIL.GENERATE, emailData);
    } catch (error) {
      throw new Error(error.data?.details || error.message || 'Failed to generate email replies');
    }
  }

  // Regenerate email replies with variations
  async regenerateReplies(emailData) {
    try {
      return await apiService.post(API_ENDPOINTS.EMAIL.REGENERATE, emailData);
    } catch (error) {
      throw new Error(error.data?.details || error.message || 'Failed to regenerate email replies');
    }
  }

  // Generate single email reply
  async generateSingleReply(emailData) {
    try {
      return await apiService.post(API_ENDPOINTS.EMAIL.GENERATE_SINGLE, emailData);
    } catch (error) {
      throw new Error(error.data?.details || error.message || 'Failed to generate email reply');
    }
  }

  // Test email generation service
  async testEmailService() {
    try {
      return await apiService.get(API_ENDPOINTS.EMAIL.TEST, {}, { includeAuth: false });
    } catch (error) {
      throw new Error('Email generation service test failed');
    }
  }
}

export const emailService = new EmailService();