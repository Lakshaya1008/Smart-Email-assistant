import React, { useState, useEffect } from 'react';
import { replyService } from '../../services/replyService';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../Common/LoadingSpinner';
import './SavedReplies.css';

const Statistics = () => {
  const { user } = useAuth();
  const { showError } = useNotification();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const data = await replyService.getReplyStatistics();
      setStats(data);
    } catch (error) {
      showError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value, total) => {
    if (!total) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  if (loading) {
    return (
      <div className="statistics-loading">
        <LoadingSpinner size="large" text="Loading statistics..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="statistics-error">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Failed to Load Statistics</h3>
          <p>We couldn't load your statistics right now. Please try again.</p>
          <button onClick={loadStatistics} className="btn btn-primary">
            <i className="fas fa-sync-alt"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics">
      <div className="statistics-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-chart-bar"></i>
            Statistics
          </h1>
          <p className="page-description">
            Overview of your email reply generation and usage patterns
          </p>
        </div>
        
        <div className="header-actions">
          <button
            onClick={loadStatistics}
            className="btn btn-outline btn-small"
            title="Refresh statistics"
          >
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>

      <div className="statistics-content">
        {/* Overview Cards */}
        <div className="stats-overview">
          <div className="stat-card primary">
            <div className="stat-icon">
              <i className="fas fa-reply-all"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalReplies || 0}</div>
              <div className="stat-label">Total Replies</div>
              <div className="stat-description">
                Email replies you've generated and saved
              </div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <i className="fas fa-heart"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.favoriteReplies || 0}</div>
              <div className="stat-label">Favorites</div>
              <div className="stat-description">
                Replies marked as favorites
              </div>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">
              <i className="fas fa-calendar-week"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.recentActivity || 0}</div>
              <div className="stat-label">Recent Activity</div>
              <div className="stat-description">
                Replies created in the last 30 days
              </div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">
              <i className="fas fa-percentage"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {formatPercentage(stats.favoriteReplies || 0, stats.totalReplies || 1)}
              </div>
              <div className="stat-label">Favorite Rate</div>
              <div className="stat-description">
                Percentage of replies marked as favorites
              </div>
            </div>
          </div>
        </div>

        <div className="stats-details">
          {/* Tone Distribution */}
          <div className="stats-section">
            <div className="section-header">
              <h2 className="section-title">
                <i className="fas fa-comment-alt"></i>
                Tone Distribution
              </h2>
              <p className="section-description">
                Breakdown of reply tones you've used
              </p>
            </div>

            <div className="tone-distribution">
              {stats.toneDistribution && Object.keys(stats.toneDistribution).length > 0 ? (
                Object.entries(stats.toneDistribution).map(([tone, count]) => (
                  <div key={tone} className="tone-item">
                    <div className="tone-header">
                      <span className="tone-name">{tone}</span>
                      <div className="tone-stats">
                        <span className="tone-count">{count}</span>
                        <span className="tone-percentage">
                          {formatPercentage(count, stats.totalReplies)}
                        </span>
                      </div>
                    </div>
                    <div className="tone-bar">
                      <div 
                        className="tone-fill"
                        style={{
                          width: formatPercentage(count, stats.totalReplies)
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <i className="fas fa-chart-pie"></i>
                  <p>No tone data available yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Subjects */}
          <div className="stats-section">
            <div className="section-header">
              <h2 className="section-title">
                <i className="fas fa-envelope"></i>
                Most Common Subjects
              </h2>
              <p className="section-description">
                Email subjects you've responded to most frequently
              </p>
            </div>

            <div className="top-subjects">
              {stats.topSubjects && stats.topSubjects.length > 0 ? (
                <div className="subjects-list">
                  {stats.topSubjects.map((subject, index) => (
                    <div key={index} className="subject-item">
                      <div className="subject-rank">#{index + 1}</div>
                      <div className="subject-content">
                        <div className="subject-name">{subject.subject}</div>
                        <div className="subject-stats">
                          <span className="subject-count">
                            {subject.count} {subject.count === 1 ? 'reply' : 'replies'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <i className="fas fa-list"></i>
                  <p>No subject data available yet</p>
                </div>
              )}
            </div>
          </div>

          {/* User Profile */}
          <div className="stats-section">
            <div className="section-header">
              <h2 className="section-title">
                <i className="fas fa-user"></i>
                Profile Information
              </h2>
              <p className="section-description">
                Your account details and preferences
              </p>
            </div>

            <div className="user-profile">
              <div className="profile-grid">
                <div className="profile-item">
                  <label>Username:</label>
                  <span>{user?.username}</span>
                </div>
                <div className="profile-item">
                  <label>Email:</label>
                  <span>{user?.email}</span>
                </div>
                {user?.firstName && (
                  <div className="profile-item">
                    <label>First Name:</label>
                    <span>{user.firstName}</span>
                  </div>
                )}
                {user?.lastName && (
                  <div className="profile-item">
                    <label>Last Name:</label>
                    <span>{user.lastName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;