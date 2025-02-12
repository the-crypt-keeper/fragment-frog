import React, { useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { clearEditor, loadState } from '../store/slices/editor';
import { StorageService } from '../services/storage';
import { RootState } from '../store';
import './ControlBar.css';

interface ControlBarProps {
  onSettingsClick: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({ onSettingsClick }) => {
 
  const dispatch = useAppDispatch();
  const state = useAppSelector((state: RootState) => state);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all fragments?')) {
      dispatch(clearEditor());
    }
  };

  const handleSave = () => {
    StorageService.exportToFile(state);
  };

  const handleLoad = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const loadedState = await StorageService.importFromFile(file);
      if (loadedState) {
        dispatch(loadState(loadedState.editor));
      }
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="control-bar">
      <button className="control-button" onClick={handleLoad}>⬆️ Load</button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        accept=".json"
      />
      <button className="control-button" onClick={handleSave}>⬇️ Save</button>
      <button className="control-button" onClick={handleClear}>💣 Clear</button>
      <button className="control-button" onClick={onSettingsClick}>⚙️ Settings</button>
    </div>
  );
};
