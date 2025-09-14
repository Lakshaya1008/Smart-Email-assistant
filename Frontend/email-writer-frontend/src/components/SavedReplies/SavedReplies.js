import React, { useState, useEffect } from 'react';
import { replyService } from '../../services/replyService';
import { useNotification } from '../../hooks/useNotification';
import { debounce } from '../../utils/helpers';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ReplyCard from './ReplyCard';
import LoadingSpinner from '../Common/LoadingSpinner';
import './SavedReplies.css';

const SavedReplies = () => {
  const { showError, showSuccess } = useNotification();
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    tone: '',
    fromDate: '',
    toDate: '',
    showFavoritesOnly: false
  });
  const [currentView, setCurrentView] = useState('all'); // 'all', 'favorites', 'search'
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 20
  });

  // Debounced search function
  const debouncedSearch = debounce((query) => {
    handleSearch(query);
  }, 500);

  useEffect(() => {
    loadReplies();
  }, [filters.showFavoritesOnly]);

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else if (currentView === 'search') {
      setCurrentView('all');
      loadReplies();
    }
  }, [searchQuery]);

  const loadReplies = async (page = 0) => {
    setLoading(true);
    try {
      let response;
      
      if (filters.showFavoritesOnly) {
        response = await replyService.getFavoriteReplies();
        setReplies(response.favorites || []);
        setPagination(prev => ({ ...prev, totalElements: response.total || 0 }));
        setCurrentView('favorites');
      } else {
        const params = {
          page,
          size: pagination.size,
          ...(filters.tone && { tone: filters.tone }),
          ...(filters.fromDate && { fromDate: filters.fromDate }),
          ...(filters.toDate && { toDate: filters.toDate })
        };
        
        response = await replyService.getReplyHistory(params);
        setReplies(response.content || []);
        setPagination({
          currentPage: response.currentPage || 0,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          size: response.size || 20
        });
        setCurrentView('all');
      }
    } catch (error) {
      showError(error.message);
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      loadReplies();
      return;
    }

    setLoading(true);
    try {
      const response = await replyService.searchReplies(query, filters.tone || null);
      setReplies(response.results || []);
      setPagination(prev => ({ ...prev, totalElements: response.total || 0 }));
      setCurrentView('search');
    } catch (error) {
      showError(error.message);
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (replyId) => {
    try {
      const response = await replyService.toggleFavorite(replyId);
      
      // Update the reply in the current list
      setReplies(prev => prev.map(reply => 
        reply.id === replyId 
          ? { ...reply, isFavorite: response.isFavorite }
          : reply
      ));
      
      showSuccess(response.message);
    } catch (error) {
      showError(error.message);
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await replyService.deleteReply(replyId);
      setReplies(prev => prev.filter(reply => reply.id !== replyId));
      showSuccess('Reply deleted successfully');
    } catch (error) {
      showError(error.message);
    }
  };

  const handleExportReplies = async () => {
    try {
      await replyService.exportReplies('csv');
      showSuccess('Replies exported successfully');
    } catch (error) {
      showError(error.message);
    }
  };

  const handlePageChange = (page) => {
    if (currentView === 'all') {
      loadReplies(page);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    if (!newFilters.showFavoritesOnly) {
      loadReplies();
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'favorites':
        return 'Favorite Replies';
      case 'search':
        return `Search Results for "${searchQuery}"`;
      default:
        return 'All Saved Replies';
    }
  };

  return (
    <div className="saved-replies">
      <div className="saved-replies-header">
        <div className="header-title-section">
          <h1 className="page-title">
            <i className="fas fa-bookmark"></i>
            Saved Replies
          </h1>
          <p className="page-description">
            Manage and search through your saved email replies
          </p>
        </div>
        
        <div className="header-actions">
          <button
            onClick={handleExportReplies}
            className="btn btn-outline"
            title="Export replies to CSV"
          >
            <i className="fas fa-download"></i>
            Export
          </button>
        </div>
      </div>

      <div className="saved-replies-content">
        <div className="replies-sidebar">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search replies..."
          />
          
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            totalCount={pagination.totalElements}
          />
        </div>

        <div className="replies-main">
          <div className="replies-view-header">
            <div className="view-info">
              <h2 className="view-title">{getViewTitle()}</h2>
              <span className="view-count">
                {loading ? '...' : `${pagination.totalElements} ${pagination.totalElements === 1 ? 'reply' : 'replies'}`}
              </span>
            </div>
            
            {currentView === 'search' && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentView('all');
                  loadReplies();
                }}
                className="btn btn-ghost btn-small"
              >
                <i className="fas fa-times"></i>
                Clear Search
              </button>
            )}
          </div>

          {loading ? (
            <div className="replies-loading">
              <LoadingSpinner size="large" text="Loading saved replies..." />
            </div>
          ) : replies.length > 0 ? (
            <>
              <div className="replies-grid">
                {replies.map(reply => (
                  <ReplyCard
                    key={reply.id}
                    reply={reply}
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={handleDeleteReply}
                  />
                ))}
              </div>

              {/* Pagination - only show for 'all' view */}
              {currentView === 'all' && pagination.totalPages > 1 && (
                <div className="replies-pagination">
                  <div className="pagination-info">
                    Showing {replies.length} of {pagination.totalElements} replies
                  </div>
                  
                  <div className="pagination-controls">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 0}
                      className="btn btn-ghost btn-small"
                    >
                      <i className="fas fa-chevron-left"></i>
                      Previous
                    </button>
                    
                    <span className="pagination-current">
                      Page {pagination.currentPage + 1} of {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages - 1}
                      className="btn btn-ghost btn-small"
                    >
                      Next
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="replies-empty">
              <div className="empty-state">
                <i className="fas fa-bookmark empty-icon"></i>
                <h3>No Saved Replies</h3>
                <p>
                  {currentView === 'search' 
                    ? `No replies found matching "${searchQuery}"`
                    : currentView === 'favorites'
                    ? 'You haven\'t marked any replies as favorites yet'
                    : 'You haven\'t saved any email replies yet. Generate some replies to get started!'
                  }
                </p>
                {currentView === 'all' && (
                  <button className="btn btn-primary">
                    <i className="fas fa-magic"></i>
                    Generate Replies
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedReplies;