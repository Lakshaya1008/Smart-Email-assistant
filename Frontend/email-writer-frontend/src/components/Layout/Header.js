import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { formatName } from '../../utils/helpers';
import './Layout.css';

const Header = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const { showSuccess } = useNotification();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    showSuccess('You have been logged out successfully.');
    setShowUserMenu(false);
  };

  const navigationItems = [
    {
      id: 'generator',
      label: 'Email Generator',
      icon: 'fas fa-magic',
      description: 'Generate AI-powered email replies'
    },
    {
      id: 'saved',
      label: 'Saved Replies',
      icon: 'fas fa-bookmark',
      description: 'View and manage your saved replies'
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: 'fas fa-chart-bar',
      description: 'View your usage statistics'
    }
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <h1 className="brand-title">
            <i className="fas fa-envelope-open-text brand-icon"></i>
            Smart Email Assistant
          </h1>
        </div>

        <nav className="header-nav">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
              title={item.description}
            >
              <i className={item.icon}></i>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="header-user">
          <div className="user-menu-container">
            <button
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="user-info">
                <span className="user-name">
                  {formatName(user?.firstName, user?.lastName) || user?.username}
                </span>
                <span className="user-email">{user?.email}</span>
              </div>
              <i className={`fas fa-chevron-down menu-arrow ${showUserMenu ? 'open' : ''}`}></i>
            </button>

            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <div className="user-details">
                    <strong>{formatName(user?.firstName, user?.lastName) || user?.username}</strong>
                    <small>{user?.email}</small>
                  </div>
                </div>
                
                <div className="user-menu-divider"></div>
                
                <div className="user-menu-items">
                  <button
                    className="user-menu-item"
                    onClick={() => {
                      onViewChange('statistics');
                      setShowUserMenu(false);
                    }}
                  >
                    <i className="fas fa-chart-bar"></i>
                    View Statistics
                  </button>
                  
                  <button
                    className="user-menu-item"
                    onClick={() => {
                      onViewChange('saved');
                      setShowUserMenu(false);
                    }}
                  >
                    <i className="fas fa-bookmark"></i>
                    Saved Replies
                  </button>
                </div>

                <div className="user-menu-divider"></div>

                <div className="user-menu-items">
                  <button
                    className="user-menu-item danger"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {showUserMenu && (
        <div 
          className="mobile-overlay"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;