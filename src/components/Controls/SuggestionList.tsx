import React from 'react';
import './SuggestionList.css';

export const SuggestionList: React.FC = () => {
  return (
    <div className="suggestions-panel">
      <div className="editor-suggestions">
        {Array(8).fill(0).map((_, index) => (
          <div
            key={index}
            className={`suggestion-item ${index < 4 ? 'primary' : 'secondary'}`}
          >
            <span className="suggestion-hint">{index + 1}</span>
            [Placeholder Suggestion {index + 1}]
          </div>
        ))}
      </div>
    </div>
  );
};