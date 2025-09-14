import { STORAGE_KEYS } from './constants';

// Token Storage
export const getStoredToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error reading token from localStorage:', error);
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } catch (error) {
    console.error('Error storing token in localStorage:', error);
  }
};

export const removeStoredToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
};

// User Storage
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    return null;
  }
};

export const setStoredUser = (user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user in localStorage:', error);
  }
};

export const removeStoredUser = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error removing user from localStorage:', error);
  }
};

// Preferences Storage
export const getStoredPreferences = () => {
  try {
    const preferences = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return preferences ? JSON.parse(preferences) : {
      theme: 'light',
      language: 'en',
      defaultTone: 'professional',
      pageSize: 20
    };
  } catch (error) {
    console.error('Error reading preferences from localStorage:', error);
    return {
      theme: 'light',
      language: 'en',
      defaultTone: 'professional',
      pageSize: 20
    };
  }
};

export const setStoredPreferences = (preferences) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error storing preferences in localStorage:', error);
  }
};

// Clear all stored data
export const clearAllStoredData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};