// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    TEST: '/api/auth/test'
  },
  
  // Email Generation
  EMAIL: {
    GENERATE: '/api/email/generate',
    REGENERATE: '/api/email/regenerate',
    GENERATE_SINGLE: '/api/email/generate-single',
    TEST: '/api/email/test'
  },
  
  // Saved Replies
  REPLIES: {
    SAVE: '/api/replies/save',
    HISTORY: '/api/replies/history',
    SEARCH: '/api/replies/search',
    FAVORITES: '/api/replies/favorites',
    FAVORITE: '/api/replies/{id}/favorite',
    DELETE: '/api/replies/{id}',
    STATS: '/api/replies/stats',
    EXPORT: '/api/replies/export'
  }
};

// Application Constants
export const APP_NAME = 'Smart Email Assistant';

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Email Tone Options
export const EMAIL_TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'concise', label: 'Concise' },
  { value: 'detailed', label: 'Detailed' }
];

// Language Options
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'hi', label: 'Hindi' }
];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'email_writer_token',
  USER: 'email_writer_user',
  PREFERENCES: 'email_writer_preferences'
};

// Validation Rules
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 6
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};

// UI Constants
export const DEBOUNCE_DELAY = 500;
export const ANIMATION_DURATION = 300;
export const TOAST_DURATION = 5000;

// File Export
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json'
};