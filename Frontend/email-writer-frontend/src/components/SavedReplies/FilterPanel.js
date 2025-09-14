import React, { useState } from 'react';
import { EMAIL_TONES } from '../../utils/constants';
import './SavedReplies.css';

const FilterPanel = ({ filters, onFilterChange, totalCount }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      tone: '',
      fromDate: '',
      toDate: '',
      showFavoritesOnly: false
    });
  };

  const hasActiveFilters = filters.tone || filters.fromDate || filters.toDate || filters.showFavoritesOnly;
  const activeFilterCount = [filters.tone, filters.fromDate, filters.toDate, filters.showFavoritesOnly].filter(Boolean).length;

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <button
          className="filter-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <i className="fas fa-filter"></i>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount}</span>
          )}
          <i className={`fas fa-chevron-down filter-chevron ${isExpanded ? 'expanded' : ''}`}></i>
        </button>
      </div>

      <div className={`filter-content ${isExpanded ? 'expanded' : ''}`}>
        {/* Quick Filters */}
        <div className="filter-section">
          <h4 className="filter-section-title">Quick Filters</h4>
          
          <div className="filter-group">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.showFavoritesOnly}
                onChange={(e) => handleFilterChange('showFavoritesOnly', e.target.checked)}
              />
              <span className="checkbox-custom">
                <i className="fas fa-check"></i>
              </span>
              <span className="checkbox-label">
                <i className="fas fa-heart"></i>
                Show favorites only
              </span>
            </label>
          </div>
        </div>

        {/* Tone Filter */}
        <div className="filter-section">
          <h4 className="filter-section-title">Tone</h4>
          
          <div className="filter-group">
            <select
              value={filters.tone}
              onChange={(e) => handleFilterChange('tone', e.target.value)}
              className="filter-select"
            >
              <option value="">All tones</option>
              {EMAIL_TONES.map(tone => (
                <option key={tone.value} value={tone.value}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="filter-section">
          <h4 className="filter-section-title">Date Range</h4>
          
          <div className="filter-group">
            <div className="date-input-group">
              <label className="date-label">From</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                className="filter-date-input"
              />
            </div>
            
            <div className="date-input-group">
              <label className="date-label">To</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                className="filter-date-input"
              />
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        {hasActiveFilters && (
          <div className="filter-actions">
            <button
              onClick={handleClearFilters}
              className="btn btn-ghost btn-small"
            >
              <i className="fas fa-times"></i>
              Clear Filters
            </button>
          </div>
        )}

        {/* Filter Summary */}
        <div className="filter-summary">
          <div className="summary-item">
            <i className="fas fa-list"></i>
            <span>{totalCount} total replies</span>
          </div>
          
          {filters.showFavoritesOnly && (
            <div className="summary-item active">
              <i className="fas fa-heart"></i>
              <span>Favorites only</span>
            </div>
          )}
          
          {filters.tone && (
            <div className="summary-item active">
              <i className="fas fa-comment-alt"></i>
              <span>{EMAIL_TONES.find(t => t.value === filters.tone)?.label} tone</span>
            </div>
          )}
          
          {(filters.fromDate || filters.toDate) && (
            <div className="summary-item active">
              <i className="fas fa-calendar"></i>
              <span>
                {filters.fromDate && filters.toDate
                  ? 'Custom date range'
                  : filters.fromDate
                  ? 'From ' + new Date(filters.fromDate).toLocaleDateString()
                  : 'Until ' + new Date(filters.toDate).toLocaleDateString()
                }
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;