import React, { useState } from 'react';
import { formatDateTime, truncateText, copyToClipboard } from '../../utils/helpers';
import { useNotification } from '../../hooks/useNotification';
import Modal from '../Common/Modal';
import './SavedReplies.css';

const ReplyCard = ({ reply, onToggleFavorite, onDelete }) => {
  const { showSuccess, showError } = useNotification();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullReply, setShowFullReply] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    favorite: false,
    delete: false
  });

  const handleCopyReply = async () => {
    try {
      await copyToClipboard(reply.replyText);
      showSuccess('Reply copied to clipboard!');
    } catch (error) {
      showError('Failed to copy reply');
    }
  };

  const handleToggleFavorite = async () => {
    setActionLoading(prev => ({ ...prev, favorite: true }));
    try {
      await onToggleFavorite(reply.id);
    } finally {
      setActionLoading(prev => ({ ...prev, favorite: false }));
    }
  };

  const handleDelete = async () => {
    setActionLoading(prev => ({ ...prev, delete: true }));
    try {
      await onDelete(reply.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }));
    }
  };

  return (
    <>
      <div className="reply-card">
        <div className="reply-card-header">
          <div className="reply-meta">
            <h3 className="reply-subject">
              {reply.emailSubject || 'Untitled Reply'}
            </h3>
            <div className="reply-details">
              <span className="reply-date">
                <i className="fas fa-calendar-alt"></i>
                {formatDateTime(reply.createdAt)}
              </span>
              {reply.tone && (
                <span className="reply-tone">
                  <i className="fas fa-comment-alt"></i>
                  {reply.tone}
                </span>
              )}
            </div>
          </div>
          
          <div className="reply-actions">
            <button
              onClick={handleToggleFavorite}
              className={`action-btn ${reply.isFavorite ? 'favorited' : ''}`}
              disabled={actionLoading.favorite}
              title={reply.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {actionLoading.favorite ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className={`fas fa-heart ${reply.isFavorite ? 'favorited' : ''}`}></i>
              )}
            </button>
            
            <button
              onClick={handleCopyReply}
              className="action-btn"
              title="Copy to clipboard"
            >
              <i className="fas fa-copy"></i>
            </button>
            
            <button
              onClick={() => setShowFullReply(true)}
              className="action-btn"
              title="View full reply"
            >
              <i className="fas fa-expand"></i>
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="action-btn danger"
              title="Delete reply"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div className="reply-card-content">
          {reply.summary && (
            <div className="reply-summary">
              <i className="fas fa-info-circle"></i>
              <span>{truncateText(reply.summary, 100)}</span>
            </div>
          )}
          
          <div className="reply-text">
            <p>{truncateText(reply.replyText, 200)}</p>
          </div>
        </div>

        <div className="reply-card-footer">
          <div className="reply-stats">
            <span className="stat-item">
              <i className="fas fa-file-word"></i>
              {reply.replyText.split(' ').length} words
            </span>
            <span className="stat-item">
              <i className="fas fa-font"></i>
              {reply.replyText.length} chars
            </span>
          </div>
          
          {reply.isFavorite && (
            <div className="favorite-indicator">
              <i className="fas fa-heart"></i>
              <span>Favorite</span>
            </div>
          )}
        </div>
      </div>

      {/* Full Reply Modal */}
      {showFullReply && (
        <Modal
          isOpen={true}
          onClose={() => setShowFullReply(false)}
          title={reply.emailSubject || 'Reply Details'}
          size="large"
        >
          <div className="full-reply-modal">
            <div className="full-reply-meta">
              <div className="meta-grid">
                <div className="meta-item">
                  <label>Created:</label>
                  <span>{formatDateTime(reply.createdAt)}</span>
                </div>
                {reply.tone && (
                  <div className="meta-item">
                    <label>Tone:</label>
                    <span className="tone-badge">{reply.tone}</span>
                  </div>
                )}
                <div className="meta-item">
                  <label>Length:</label>
                  <span>{reply.replyText.split(' ').length} words, {reply.replyText.length} characters</span>
                </div>
              </div>
            </div>

            {reply.summary && (
              <div className="full-reply-summary">
                <h4>Summary</h4>
                <p>{reply.summary}</p>
              </div>
            )}

            <div className="full-reply-content">
              <h4>Reply Content</h4>
              <div className="reply-text-full">
                <p>{reply.replyText}</p>
              </div>
            </div>

            <div className="full-reply-actions">
              <button
                onClick={handleCopyReply}
                className="btn btn-outline"
              >
                <i className="fas fa-copy"></i>
                Copy to Clipboard
              </button>
              
              <button
                onClick={handleToggleFavorite}
                className={`btn ${reply.isFavorite ? 'btn-secondary' : 'btn-primary'}`}
                disabled={actionLoading.favorite}
              >
                {actionLoading.favorite ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className={`fas fa-heart ${reply.isFavorite ? 'favorited' : ''}`}></i>
                    {reply.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Reply"
          size="small"
        >
          <div className="delete-confirm-modal">
            <div className="confirm-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            
            <div className="confirm-content">
              <h3>Delete this reply?</h3>
              <p>
                This action cannot be undone. The reply will be permanently removed 
                from your saved replies.
              </p>
            </div>
            
            <div className="confirm-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
                disabled={actionLoading.delete}
              >
                Cancel
              </button>
              
              <button
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={actionLoading.delete}
              >
                {actionLoading.delete ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash"></i>
                    Delete Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ReplyCard;