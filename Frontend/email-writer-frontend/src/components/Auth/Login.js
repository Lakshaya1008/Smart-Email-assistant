import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { validateUsername, validatePassword } from '../../utils/helpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-50 characters and contain only letters, numbers, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login({
        username: formData.username.trim(),
        password: formData.password
      });
      showSuccess('Login successful! Welcome back.');
    } catch (error) {
      showError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`form-input ${errors.username ? 'error' : ''}`}
            placeholder="Enter your username"
            disabled={loading}
            autoComplete="username"
          />
          {errors.username && (
            <div className="form-error">{errors.username}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="Enter your password"
            disabled={loading}
            autoComplete="current-password"
          />
          {errors.password && (
            <div className="form-error">{errors.password}</div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full-width btn-large"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;