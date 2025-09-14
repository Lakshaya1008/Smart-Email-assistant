import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuth } from './hooks/useAuth';
import { useNotification } from './hooks/useNotification';

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Layout from './components/Layout/Layout';
import EmailGenerator from './components/EmailGenerator/EmailGenerator';
import SavedReplies from './components/SavedReplies/SavedReplies';
import Statistics from './components/SavedReplies/Statistics';
import Notification from './components/Common/Notification';
import LoadingSpinner from './components/Common/LoadingSpinner';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { notification } = useNotification();
  const [currentView, setCurrentView] = useState('generator');
  const [showLogin, setShowLogin] = useState(true);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="app-loading">
        <LoadingSpinner size="large" />
        <p>Loading Smart Email Assistant...</p>
      </div>
    );
  }

  // Show authentication forms if user is not logged in
  if (!user) {
    return (
      <div className="App">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Smart Email Assistant</h1>
            <p>AI-powered email reply generation</p>
          </div>
          
          <div className="auth-toggle">
            <button 
              className={showLogin ? 'active' : ''}
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
            <button 
              className={!showLogin ? 'active' : ''}
              onClick={() => setShowLogin(false)}
            >
              Register
            </button>
          </div>

          <div className="auth-form">
            {showLogin ? <Login /> : <Register />}
          </div>
        </div>
        
        {notification && <Notification {...notification} />}
      </div>
    );
  }

  // Render main application for authenticated users
  const renderCurrentView = () => {
    switch (currentView) {
      case 'generator':
        return <EmailGenerator />;
      case 'saved':
        return <SavedReplies />;
      case 'statistics':
        return <Statistics />;
      default:
        return <EmailGenerator />;
    }
  };

  return (
    <div className="App">
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        {renderCurrentView()}
      </Layout>
      
      {notification && <Notification {...notification} />}
    </div>
  );
}

export default App;