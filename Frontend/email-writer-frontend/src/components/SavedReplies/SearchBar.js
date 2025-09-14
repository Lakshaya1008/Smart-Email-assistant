import React, { useState, useRef } from 'react';
import './SavedReplies.css';

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`search-bar ${isFocused ? 'focused' : ''}`}>
      <div className="search-input-container">
        <i className="fas fa-search search-icon"></i>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input"
        />
        {value && (
          <button
            onClick={handleClear}
            className="search-clear"
            type="button"
            title="Clear search"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
      
      {value && (
        <div className="search-status">
          <i className="fas fa-search"></i>
          <span>Searching for "{value}"</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;