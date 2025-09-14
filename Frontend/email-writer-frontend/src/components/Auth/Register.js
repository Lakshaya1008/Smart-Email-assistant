import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { validateEmail, validateUsername, validatePassword } from '../../utils/helpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Auth.css';

const Register = () => {
  const { register } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
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

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-50 characters and contain only letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await register({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName.trim() || null,
        lastName: formData.lastName.trim() || null
      });
      showSuccess('Registration successful! Welcome to Smart Email Assistant.');
    } catch (error) {
      showError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              First Name (Optional)
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your first name"
              disabled={loading}
              autoComplete="given-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              Last Name (Optional)
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your last name"
              disabled={loading}
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`form-input ${errors.username ? 'error' : ''}`}
            placeholder="Choose a username"
            disabled={loading}
            autoComplete="username"
          />
          {errors.username && (
            <div className="form-error">{errors.username}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email address"
            disabled={loading}
            autoComplete="email"
          />
          {errors.email && (
            <div className="form-error">{errors.email}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="Create a password"
            disabled={loading}
            autoComplete="new-password"
          />
          {errors.password && (
            <div className="form-error">{errors.password}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password *
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="Confirm your password"
            disabled={loading}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <div className="form-error">{errors.confirmPassword}</div>
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
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
};

export default Register;