import React from 'react';
import { useAppDispatch } from '../../hooks/redux';
import { clearEditor } from '../../store/slices/editor';
import './ControlBar.css';

export const ControlBar: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all fragments?')) {
      dispatch(clearEditor());
    }
  };

  return (
    <div className="control-bar">
      <button className="control-button">Load</button>
      <button className="control-button">Save</button>
      <button className="control-button" onClick={handleClear}>
        Clear
      </button>
      <button className="control-button">Settings</button>
    </div>
  );
};