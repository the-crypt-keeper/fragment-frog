import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import './SuggestionList.css';

export const SuggestionList: React.FC = () => {
  const { systemConfig, models, suggestions, modelStatuses, errors } = useAppSelector(state => state.llm);
  const insertedSuggestions = useAppSelector(state => state.editor.insertedSuggestions);

  // Create grid template based on configuration
  const gridStyle = {
    gridTemplateRows: `repeat(${systemConfig.gridRows}, 1fr)`,
    gridTemplateColumns: `repeat(${systemConfig.gridColumns}, 1fr)`,
  };

  // Find which model owns each slot
  const getModelForSlot = (index: number) => {
    return models.find(model => 
      index >= model.gridOffset && 
      index < model.gridOffset + model.numCompletions
    );
  };

  return (
    <div className="suggestions-panel">
      <div className="editor-suggestions" style={gridStyle}>
        {Array(systemConfig.gridRows * systemConfig.gridColumns).fill(0).map((_, index) => {
          const model = getModelForSlot(index);
          const status = model ? modelStatuses[model.id] : undefined;
          const error = model ? errors[model.id] : undefined;

          return (
            <div
              key={index}
              className={`suggestion-item ${insertedSuggestions.includes(index) ? 'fade-out' : ''}`}
              style={{ backgroundColor: model ? `${model.color}20` : '#f0f0f0' }}
            >
              <span className="suggestion-hint">{index + 1}</span>
              {error ? (
                <span className="error">{error}</span>
              ) : status === 'WAITING' ? (
                <span className="loading">Waiting...</span>
              ) : (
                suggestions[index] === null ? 
                  (model ? `${model.model} (slot ${index - model.gridOffset + 1})` : 'Unassigned slot') :
                  suggestions[index] || (status === 'RUNNING' ? '' : '[empty]')
              )}
              {model && (
                <div 
                  className={`status-indicator ${status?.toLowerCase()}`}
                  style={{ backgroundColor: model.color }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
