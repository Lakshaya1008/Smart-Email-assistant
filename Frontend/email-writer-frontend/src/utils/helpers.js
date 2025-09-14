import { VALIDATION_RULES } from './constants';

// Validation Helpers
export const validateEmail = (email) => {
  return VALIDATION_RULES.EMAIL.PATTERN.test(email);
};

export const validateUsername = (username) => {
  if (!username) return false;
  if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) return false;
  if (username.length > VALIDATION_RULES.USERNAME.MAX_LENGTH) return false;
  return VALIDATION_RULES.USERNAME.PATTERN.test(username);
};

export const validatePassword = (password) => {
  return password && password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH;
};

// Text Helpers
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatName = (firstName, lastName) => {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.join(' ');
};

// Date Helpers
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const target = new Date(date);
  const diff = now - target;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

// URL Helpers
export const buildUrl = (base, endpoint, params = {}) => {
  const url = new URL(endpoint, base);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
};

// Array Helpers
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key] || 'Other';
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, ascending = true) => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) return ascending ? -1 : 1;
    if (aValue > bValue) return ascending ? 1 : -1;
    return 0;
  });
};

// Object Helpers
export const omit = (obj, keys) => {
  const keysToOmit = Array.isArray(keys) ? keys : [keys];
  return Object.keys(obj)
    .filter(key => !keysToOmit.includes(key))
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

export const pick = (obj, keys) => {
  const keysToPick = Array.isArray(keys) ? keys : [keys];
  return keysToPick.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

// Debounce Function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle Function
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// File Helpers
export const downloadFile = (data, filename, type = 'text/plain') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Copy to Clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

// Generate Random ID
export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Format File Size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};