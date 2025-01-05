import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { SystemConfig, ModelConfig } from '../../types/llm';
import { updateSystemConfig, updateModelConfigs } from '../../store/slices/llm';
import { LLMService, ModelInfo } from '../../services/llm';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { systemConfig, models } = useAppSelector(state => state.llm);

  // Local state for form
  const [localConfig, setLocalConfig] = useState<SystemConfig>(systemConfig);
  const [localModels, setLocalModels] = useState<ModelConfig[]>(models);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    // Update grid offsets
    let offset = 0;
    const updatedModels = localModels.map(model => ({
      ...model,
      gridOffset: offset,
      numCompletions: Math.min(model.numCompletions, totalSlots - offset)
    }));

    dispatch(updateSystemConfig(localConfig));
    dispatch(updateModelConfigs(updatedModels));
    onClose();
  };

  const renderModelSelect = (model: ModelConfig, index: number) => (
    <select
      value={model.model}
      onChange={e => {
        const newModels = [...localModels];
        newModels[index] = { ...model, model: e.target.value };
        setLocalModels(newModels);
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <option>Loading models...</option>
      ) : error ? (
        <option>Error loading models</option>
      ) : (        
        availableModels.map(m => (
          <option key={m.id} value={m.id}>{m.id}</option>
        ))
      )}
    </select>
  );

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
          <h3>Model Configuration</h3>
          {localModels.map((model, index) => (
            <div key={model.id} className="model-config-item">
              <div className="model-header">
                <h4>Model {index + 1}</h4>
                <input
                  type="color"
                  value={model.color}
                  onChange={e => {
                    const newModels = [...localModels];
                    newModels[index] = { ...model, color: e.target.value };
                    setLocalModels(newModels);
                  }}
                />
              </div>
              
              {renderModelSelect(model, index)}

              <input
                type="text"
                placeholder="Tokenizer (optional)"
                value={model.tokenizer || ''}
                onChange={e => {
                  const newModels = [...localModels];
                  newModels[index] = { ...model, tokenizer: e.target.value || null };
                  setLocalModels(newModels);
                }}
              />

              <label>
                Temperature:
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
                <span>{model.temperature.toFixed(1)}</span>
              </label>

              <label>
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

              <label>
                Completions:
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
              </label>
            </div>
          ))}
        </section>

        <div className="modal-buttons">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};