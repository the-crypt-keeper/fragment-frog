import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { SystemConfig, ModelConfig } from '../types/llm';
import { updateSystemConfig, updateModelConfigs } from '../store/slices/llm';
import { LLMService, ModelInfo } from '../services/llm';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  // Prevent keyboard events from bubbling when modal is open
  useEffect(() => {
    if (isOpen) {
      const handler = (e: KeyboardEvent) => {
        e.stopPropagation();
      };
      window.addEventListener('keydown', handler, true);
      return () => window.removeEventListener('keydown', handler, true);
    }
  }, [isOpen]);
  const dispatch = useAppDispatch();
  const { systemConfig, models } = useAppSelector(state => state.llm);

  // Local state for form
  const [localConfig, setLocalConfig] = useState<SystemConfig>(systemConfig);
  const [localModels, setLocalModels] = useState<ModelConfig[]>(models);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelIdEdits, setModelIdEdits] = useState<Record<string, string>>({});

  // Fetch available models when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      
      LLMService.getAvailableModels()
        .then(models => {
          setAvailableModels(models);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Failed to load models');
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalConfig(systemConfig);
      setLocalModels(models);
    }
  }, [isOpen, systemConfig, models]);

  const handleSave = () => {
    // Validate total completions <= grid slots
    const totalSlots = localConfig.gridRows * localConfig.gridColumns;
    const totalCompletions = localModels.reduce((sum, model) => sum + model.numCompletions, 0);
    
    if (totalCompletions > totalSlots) {
      alert(`Total completions (${totalCompletions}) exceeds available grid slots (${totalSlots})`);
      return;
    }

    // Update grid offsets based on previous models' completions
    const updatedModels = localModels.map((model, index) => {
      const offset = localModels
        .slice(0, index)
        .reduce((sum, prevModel) => sum + prevModel.numCompletions, 0);
      return {
        ...model,
        gridOffset: offset,
        numCompletions: Math.min(model.numCompletions, totalSlots - offset)
      };
    });

    dispatch(updateSystemConfig(localConfig));
    dispatch(updateModelConfigs(updatedModels));
    onClose();
  };

  const addNewModel = (modelInfo: ModelInfo) => {
    const newModel: ModelConfig = {
      id: modelInfo.id,
      model: modelInfo.id,
      tokenizer: null,
      temperature: 1.0,
      stopAtPeriod: true,
      numCompletions: 1,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      gridOffset: localModels.reduce((sum, model) => sum + model.numCompletions, 0)
    };
    setLocalModels([...localModels, newModel]);
  };

  const moveModel = (fromIndex: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && fromIndex === 0) || 
      (direction === 'down' && fromIndex === localModels.length - 1)
    ) return;

    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    const newModels = [...localModels];
    const [model] = newModels.splice(fromIndex, 1);
    newModels.splice(toIndex, 0, model);
    setLocalModels(newModels);
  };

  const deleteModel = (index: number) => {
    const newModels = [...localModels];
    newModels.splice(index, 1);
    setLocalModels(newModels);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <h2>Settings</h2>

        {error && (
          <div className="error-message">
            Error loading models: {error}
          </div>
        )}

        <section className="grid-config">
          <h3>Grid Configuration</h3>
          <div className="grid-controls">
            <label>
              Rows:
              <input
                type="number"
                min="1"
                max="3"
                value={localConfig.gridRows}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  gridRows: Math.max(1, Math.min(3, parseInt(e.target.value) || 1))
                })}
              />
            </label>
            <label>
              Columns:
              <input
                type="number"
                min="2"
                max="5"
                value={localConfig.gridColumns}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  gridColumns: Math.max(2, Math.min(5, parseInt(e.target.value) || 2))
                })}
              />
            </label>
          </div>
        </section>

        <section className="system-prompt">
          <h3>System Prompt</h3>
          <textarea
            value={localConfig.systemPrompt}
            onChange={e => setLocalConfig({
              ...localConfig,
              systemPrompt: e.target.value
            })}
            rows={3}
          />
        </section>

        <section className="model-config">
          <h3>Configured Models</h3>
          {localModels.map((model, index) => (
            <div key={model.id} className="model-config-item">
              <div className="model-header">
                <input
                  type="text"
                  value={modelIdEdits[model.id] ?? model.id}
                  onChange={e => {
                    setModelIdEdits({
                      ...modelIdEdits,
                      [model.id]: e.target.value
                    });
                  }}
                  onBlur={() => {
                    if (modelIdEdits[model.id]) {
                      const newModels = [...localModels];
                      newModels[index] = { 
                        ...model, 
                        id: modelIdEdits[model.id],
                      };
                      setLocalModels(newModels);
                      setModelIdEdits({});
                    }
                  }}
                  placeholder="Model ID"
                  className="model-id-input"
                />
                <div className="model-header-controls">
                  <input
                    type="color"
                    value={model.color}
                    onChange={e => {
                      const newModels = [...localModels];
                      newModels[index] = { ...model, color: e.target.value };
                      setLocalModels(newModels);
                    }}
                  />
                  <button 
                    onClick={() => moveModel(index, 'up')}
                    disabled={index === 0}
                    className="model-control-button"
                  >
                    ↑
                  </button>
                  <button 
                    onClick={() => moveModel(index, 'down')}
                    disabled={index === localModels.length - 1}
                    className="model-control-button"
                  >
                    ↓
                  </button>
                  <button 
                    onClick={() => deleteModel(index)}
                    className="model-control-button delete"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="model-controls-row">
                <select
                  className="tokenizer-select"
                  value={
                    !model.tokenizer ? 'chat' :
                    model.tokenizer.includes('### Instruction:') ? 'alpaca' :
                    model.tokenizer.includes('SYSTEM:') ? 'vicuna' :
                    model.tokenizer === '{system}\n{prompt}' ? 'raw' : 'chat'
                  }
                  onChange={e => {
                    const newModels = [...localModels];
                    const value = e.target.value;
                    let template = null;
                    if (value === 'alpaca') {
                      template = '### Instruction:\n{system}\n\n### Input:\n{prompt}\n\n### Response:';
                    } else if (value === 'vicuna') {
                      template = 'SYSTEM: {system}\n\nUSER: {prompt}\n\nA:';
                    } else if (value === 'raw') {
                      template = '{system}\n{prompt}';
                    }
                    newModels[index] = { ...model, tokenizer: template };
                    setLocalModels(newModels);
                  }}
                >
                  <option value="chat">Chat</option>
                  <option value="alpaca">Text (Alpaca)</option>
                  <option value="vicuna">Text (Vicuna)</option>
                  <option value="raw">Text (Raw)</option>
                </select>

                <div className="temperature-control">
                  <span>Temp: {model.temperature.toFixed(1)}</span>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={model.temperature}
                    onChange={e => {
                      const newModels = [...localModels];
                      newModels[index] = { ...model, temperature: parseFloat(e.target.value) };
                      setLocalModels(newModels);
                    }}
                  />
                </div>

                <label className="stop-period-control">
                  <input
                    type="checkbox"
                    checked={model.stopAtPeriod}
                    onChange={e => {
                      const newModels = [...localModels];
                      newModels[index] = { ...model, stopAtPeriod: e.target.checked };
                      setLocalModels(newModels);
                    }}
                  />
                  Stop at period
                </label>

                <div className="completions-control">
                  <span>Completions:</span>
                  <input
                    type="number"
                    min="1"
                    max={localConfig.gridRows * localConfig.gridColumns}
                    value={model.numCompletions}
                    onChange={e => {
                      const newModels = [...localModels];
                      newModels[index] = { ...model, numCompletions: parseInt(e.target.value) || 1 };
                      setLocalModels(newModels);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="add-model-section">
          <h3>Add Model</h3>
          {isLoading ? (
            <div>Loading available models...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="available-models-grid">
              {availableModels.map(model => (
                <button
                  key={model.id}
                  onClick={() => addNewModel(model)}
                  className="add-model-button"
                  disabled={localModels.some(m => m.model === model.id)}
                >
                  {model.id}
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="modal-buttons">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};
