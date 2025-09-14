import React, { useEffect, useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import './Common.css';

const Notification = ({ type = 'info', message, duration = 5000 }) => {
  const { hideNotification } = useNotification();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => hideNotification(), 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, hideNotification]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
      default:
        return 'fas fa-info-circle';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => hideNotification(), 300);
  };

  return (
    <div className={`notification notification-${type} ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="notification-content">
        <i className={`notification-icon ${getIcon()}`}></i>
        <span className="notification-message">{message}</span>
        <button 
          className="notification-close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default Notification;