import { API_BASE_URL } from '../utils/constants';
import { getStoredToken, removeStoredToken } from '../utils/storage';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Create request headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = getStoredToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Handle API responses
  async handleResponse(response) {
    if (response.status === 401) {
      // Token expired or invalid
      removeStoredToken();
      window.location.href = '/';
      throw new Error('Authentication failed. Please login again.');
    }

    const contentType = response.headers.get('Content-Type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(data.message || data.reason || 'An error occurred');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  // GET request
  async get(endpoint, params = {}, options = {}) {
    const url = new URL(endpoint, this.baseURL);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(options.includeAuth !== false),
      ...options
    });

    return this.handleResponse(response);
  }

  // POST request
  async post(endpoint, data = {}, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(options.includeAuth !== false),
      body: JSON.stringify(data),
      ...options
    });

    return this.handleResponse(response);
  }

  // PUT request
  async put(endpoint, data = {}, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(options.includeAuth !== false),
      body: JSON.stringify(data),
      ...options
    });

    return this.handleResponse(response);
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(options.includeAuth !== false),
      ...options
    });

    return this.handleResponse(response);
  }

  // Upload file
  async upload(endpoint, formData, options = {}) {
    const headers = {};
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      ...options
    });

    return this.handleResponse(response);
  }

  // Download file
  async download(endpoint, filename, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(options.includeAuth !== false),
      ...options
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const apiService = new ApiService();