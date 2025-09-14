import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ currentView, onViewChange, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobileSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    checkMobileSize();
    window.addEventListener('resize', checkMobileSize);

    return () => window.removeEventListener('resize', checkMobileSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      <Header 
        currentView={currentView} 
        onViewChange={onViewChange}
      />
      
      <div className="layout-body">
        <Sidebar
          currentView={currentView}
          onViewChange={onViewChange}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />
        
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="main-header">
            <button
              className="mobile-menu-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <i className="fas fa-bars"></i>
            </button>
            
            <div className="breadcrumb">
              <i className="fas fa-home"></i>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">
                {currentView === 'generator' && 'Email Generator'}
                {currentView === 'saved' && 'Saved Replies'}
                {currentView === 'statistics' && 'Statistics'}
              </span>
            </div>
          </div>
          
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;