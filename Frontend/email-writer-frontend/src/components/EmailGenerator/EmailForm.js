import React, { useState, useEffect } from 'react';
import { EMAIL_TONES, LANGUAGE_OPTIONS } from '../../utils/constants';
import { rateLimiter } from '../../utils/rateLimiter';
import LoadingSpinner from '../Common/LoadingSpinner';
import './EmailGenerator.css';


const EmailForm = ({ onGenerate, loading }) => {
  const [formData, setFormData] = useState({
    subject: '',
    emailContent: '',
    tone: 'professional',
    language: 'en'
  });
  const [errors, setErrors] = useState({});
  const [rateLimitStatus, setRateLimitStatus] = useState(null);
  const [usageStats, setUsageStats] = useState(null);

  // Update rate limit status periodically
  useEffect(() => {
    const updateStatus = () => {
      const stats = rateLimiter.getUsageStats();
      setUsageStats(stats);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Update rate limit check when content changes
    if (name === 'emailContent' || name === 'subject') {
      const canRequest = rateLimiter.canMakeRequest(
        name === 'emailContent' ? value : formData.emailContent,
        name === 'subject' ? value : formData.subject
      );
      setRateLimitStatus(canRequest);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Email subject is required';
    }

    if (!formData.emailContent.trim()) {
      newErrors.emailContent = 'Email content is required';
    } else if (formData.emailContent.trim().length < 10) {
      newErrors.emailContent = 'Email content should be at least 10 characters';
    } else if (formData.emailContent.trim().length > 2000) {
      newErrors.emailContent = 'Email content too long (max 2000 characters to stay within API limits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    // Final rate limit check
    const canRequest = rateLimiter.canMakeRequest(formData.emailContent, formData.subject);
    if (!canRequest.canProceed) {
      setRateLimitStatus(canRequest);
      return;
    }
    // Record the request
    rateLimiter.recordRequest(formData.emailContent, formData.subject);
    onGenerate({
      subject: formData.subject.trim(),
      emailContent: formData.emailContent.trim(),
      tone: formData.tone,
      language: formData.language
    });
  };

  const handleClear = () => {
    setFormData({
      subject: '',
      emailContent: '',
      tone: 'professional',
      language: 'en'
    });
    setErrors({});
    setRateLimitStatus(null);
  };

  const getRateLimitWarning = () => {
    if (!rateLimitStatus || rateLimitStatus.canProceed) return null;
    const { reasons, timeUntilReset } = rateLimitStatus;
    if (reasons.dailyLimitReached) {
      return {
        type: 'error',
        message: `Daily API limit reached (200 requests). Resets in ${timeUntilReset.daily} hours.`
      };
    }
    if (reasons.rateLimited) {
      return {
        type: 'warning',
        message: `Rate limit reached (8 requests per minute). Please wait ${Math.ceil(timeUntilReset.minute)} seconds.`
      };
    }
    if (reasons.tokenLimitReached) {
      return {
        type: 'warning',
        message: `Token limit reached. Please shorten your email content or wait ${Math.ceil(timeUntilReset.minute)} seconds.`
      };
    }
    return null;
  };

  const warning = getRateLimitWarning();
  const canSubmit = !loading && (!rateLimitStatus || rateLimitStatus.canProceed);

  return (
    <div className="email-form-container">
      <div className="form-header">
        <h2 className="form-title">
          <i className="fas fa-envelope"></i>
          Original Email
        </h2>
        <p className="form-description">
          Paste the email you want to respond to, and we'll generate multiple reply options.
        </p>
        {/* API Usage Stats */}
        {usageStats && (
          <div className="api-usage-stats">
            <div className="usage-grid">
              <div className="usage-item">
                <span className="usage-label">Today:</span>
                <span className="usage-value">
                  {usageStats.requestsToday}/{usageStats.maxRequestsPerDay}
                </span>
                <div className="usage-bar">
                  <div 
                    className="usage-fill"
                    style={{ width: `${Math.min(usageStats.percentageUsed.daily, 100)}%` }}
                  />
                </div>
              </div>
              <div className="usage-item">
                <span className="usage-label">This Minute:</span>
                <span className="usage-value">
                  {usageStats.requestsThisMinute}/{usageStats.maxRequestsPerMinute}
                </span>
                <div className="usage-bar">
                  <div 
                    className="usage-fill"
                    style={{ width: `${Math.min(usageStats.percentageUsed.minute, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rate Limit Warning */}
      {warning && (
        <div className={`rate-limit-warning ${warning.type}`}>
          <i className={`fas ${warning.type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}`}></i>
          <span>{warning.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="email-form">
        <div className="form-group">
          <label htmlFor="subject" className="form-label">
            Email Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`form-input ${errors.subject ? 'error' : ''}`}
            placeholder="e.g., Meeting Request, Project Update, Follow-up..."
            disabled={loading}
            maxLength="100"
          />
          {errors.subject && (
            <div className="form-error">{errors.subject}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="emailContent" className="form-label">
            Email Content
            <span className="char-counter">
              {formData.emailContent.length}/2000 characters
            </span>
          </label>
          <textarea
            id="emailContent"
            name="emailContent"
            value={formData.emailContent}
            onChange={handleChange}
            className={`form-input form-textarea ${errors.emailContent ? 'error' : ''}`}
            placeholder="Paste the original email content here..."
            rows="6"
            disabled={loading}
            maxLength="2000"
          />
          {errors.emailContent && (
            <div className="form-error">{errors.emailContent}</div>
          )}
          <div className="form-hint">
            <i className="fas fa-info-circle"></i>
            Keep content under 2000 characters to stay within API token limits
          </div>
          {/* Token Estimation */}
          {formData.emailContent && (
            <div className="token-estimate">
              <i className="fas fa-calculator"></i>
              Estimated tokens: ~{rateLimiter.estimateTokens(formData.emailContent + formData.subject)}
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tone" className="form-label">
              Reply Tone
            </label>
            <select
              id="tone"
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              className="form-select"
              disabled={loading}
            >
              {EMAIL_TONES.map(tone => (
                <option key={tone.value} value={tone.value}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="language" className="form-label">
              Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="form-select"
              disabled={loading}
            >
              {LANGUAGE_OPTIONS.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary"
            disabled={loading}
          >
            <i className="fas fa-eraser"></i>
            Clear
          </button>
          
          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={!canSubmit}
            title={!canSubmit && rateLimitStatus ? warning?.message : ''}
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i>
                Generate Replies
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailForm;