import React, { useState } from 'react';
import './SettingsModal.css';

function SettingsModal({ isOpen, onClose, primaryModel, secondaryModel, onSave }) {
  const [systemPrompt, setSystemPrompt] = useState('You are a creative writing assistant. Continue the story provided by the user.');
  const [primaryTemperature, setPrimaryTemperature] = useState(1.0);
  const [secondaryTemperature, setSecondaryTemperature] = useState(1.0);
  const [primaryStop, setPrimaryStop] = useState(true);
  const [secondaryStop, setSecondaryStop] = useState(true);

  const handleSave = () => {
    onSave({
      systemPrompt,
      primaryTemperature,
      secondaryTemperature,
      primaryStop,
      secondaryStop
    });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <h2>Settings</h2>
        <div className="settings-content">
          <div className="settings-column">
            <h3>System Prompt</h3>
            <label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
              />
            </label>
          </div>
          <div className="settings-column">
            <h3>Primary Model ({primaryModel})</h3>
            <label>
              Temperature:
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={primaryTemperature}
                onChange={(e) => setPrimaryTemperature(parseFloat(e.target.value))}
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={primaryStop}
                onChange={(e) => setPrimaryStop(e.target.checked)}
              />
              Stop at period
            </label>
          </div>
          <div className="settings-column">
            <h3>Secondary Model ({secondaryModel})</h3>
            <label>
              Temperature:
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={secondaryTemperature}
                onChange={(e) => setSecondaryTemperature(parseFloat(e.target.value))}
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={secondaryStop}
                onChange={(e) => setSecondaryStop(e.target.checked)}
              />
              Stop at period
            </label>
          </div>
        </div>
        <div className="settings-buttons">
          <button onClick={handleClose}>Cancel</button>
          <button onClick={handleSave}>OK</button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
