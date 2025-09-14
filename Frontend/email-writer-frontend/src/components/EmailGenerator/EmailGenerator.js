import React, { useState } from 'react';
import EmailForm from './EmailForm';
import EmailReplies from './EmailReplies';
import { emailService } from '../../services/emailService';
import { useNotification } from '../../hooks/useNotification';
import LoadingSpinner from '../Common/LoadingSpinner';
import './EmailGenerator.css';

const EmailGenerator = () => {
  const { showError, showSuccess } = useNotification();
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState(null);
  const [lastRequest, setLastRequest] = useState(null);

  const handleGenerateReplies = async (emailData) => {
    setLoading(true);
    try {
      const response = await emailService.generateReplies(emailData);
      setReplies(response);
      setLastRequest(emailData);
      showSuccess('Email replies generated successfully!');
    } catch (error) {
      showError(error.message);
      setReplies(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateReplies = async () => {
    if (!lastRequest) return;
    
    setLoading(true);
    try {
      const response = await emailService.regenerateReplies(lastRequest);
      setReplies(response);
      showSuccess('New reply variations generated!');
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearReplies = () => {
    setReplies(null);
    setLastRequest(null);
  };

  return (
    <div className="email-generator">
      <div className="generator-header">
        <h1 className="generator-title">
          <i className="fas fa-magic"></i>
          Email Generator
        </h1>
        <p className="generator-description">
          Generate AI-powered email replies with different tones and styles. 
          Simply paste the original email and let our AI create professional responses for you.
        </p>
      </div>

      <div className="generator-content">
        <div className="generator-form-section">
          <EmailForm 
            onGenerate={handleGenerateReplies}
            loading={loading}
          />
        </div>

        {loading && (
          <div className="generator-loading">
            <LoadingSpinner size="large" text="Generating email replies..." />
            <p className="loading-message">
              Our AI is crafting personalized responses for you. This may take a few moments.
            </p>
          </div>
        )}

        {replies && !loading && (
          <div className="generator-results-section">
            <EmailReplies
              replies={replies}
              onRegenerate={handleRegenerateReplies}
              onClear={handleClearReplies}
              canRegenerate={!!lastRequest}
              loading={loading}
            />
          </div>
        )}

        {!replies && !loading && (
          <div className="generator-placeholder">
            <div className="placeholder-content">
              <i className="fas fa-envelope-open-text placeholder-icon"></i>
              <h3>Ready to Generate Email Replies</h3>
              <p>
                Fill out the form above to get started. Our AI will analyze the email content 
                and generate multiple professional reply options for you to choose from.
              </p>
              <div className="placeholder-features">
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Multiple reply variations</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Customizable tone and style</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Multi-language support</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Save your favorites</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailGenerator;