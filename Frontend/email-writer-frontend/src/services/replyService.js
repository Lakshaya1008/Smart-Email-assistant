import { apiService } from './api';
import { API_ENDPOINTS } from '../utils/constants';

class ReplyService {
  // Save a reply
  async saveReply(replyData) {
    try {
      return await apiService.post(API_ENDPOINTS.REPLIES.SAVE, replyData);
    } catch (error) {
      throw new Error(error.data?.reason || error.message || 'Failed to save reply');
    }
  }

  // Get reply history with pagination
  async getReplyHistory(params = {}) {
    try {
      return await apiService.get(API_ENDPOINTS.REPLIES.HISTORY, params);
    } catch (error) {
      throw new Error(error.data?.reason || error.message || 'Failed to fetch reply history');
    }
  }

  // Search replies
  async searchReplies(query, tone = null) {
    try {
      const params = { q: query };
      if (tone) params.tone = tone;
      return await apiService.get(API_ENDPOINTS.REPLIES.SEARCH, params);
    } catch (error) {
      throw new Error(error.data?.reason || error.message || 'Failed to search replies');
    }
  }

  // Get favorite replies
  async getFavoriteReplies() {
    try {
      return await apiService.get(API_ENDPOINTS.REPLIES.FAVORITES);
    } catch (error) {
      throw new Error(error.data?.reason || error.message || 'Failed to fetch favorite replies');
    }
  }

  // Toggle favorite status
  async toggleFavorite(replyId) {
    try {
      const endpoint = API_ENDPOINTS.REPLIES.FAVORITE.replace('{id}', replyId);
      return await apiService.put(endpoint);
    } catch (error) {
      throw new Error(error.data?.reason || error.message || 'Failed to toggle favorite status');
    }
  }

  // Delete a reply
  async deleteReply(replyId) {
    try {
      const endpoint = API_ENDPOINTS.REPLIES.DELETE.replace('{id}', replyId);
      return await apiService.delete(endpoint);
    } catch (error) {
      throw new Error(error.data?.reason || error.message || 'Failed to delete reply');
    }
  }

  // Get reply statistics
  async getReplyStatistics() {
    try {
      return await apiService.get(API_ENDPOINTS.REPLIES.STATS);
    } catch (error) {
      throw new Error(error.data?.reason || error.message || 'Failed to fetch reply statistics');
    }
  }

  // Export replies
  async exportReplies(format = 'csv') {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `saved_replies_${timestamp}.${format}`;
      await apiService.download(API_ENDPOINTS.REPLIES.EXPORT, filename);
    } catch (error) {
      throw new Error(error.data?.reason || error.message || 'Failed to export replies');
    }
  }
}

export const replyService = new ReplyService();