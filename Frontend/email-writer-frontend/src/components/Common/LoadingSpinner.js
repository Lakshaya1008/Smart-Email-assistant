import React from 'react';
import './Common.css';

const LoadingSpinner = ({ size = 'medium', text = '', className = '' }) => {
  const sizeClass = `spinner-${size}`;
  
  return (
    <div className={`loading-spinner ${className}`}>
      <div className={`spinner ${sizeClass}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;