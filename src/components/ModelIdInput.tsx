import React, { useState, useEffect } from 'react';

interface ModelIdInputProps {
  initialValue: string;
  onChange: (value: string) => void;
}

export const ModelIdInput: React.FC<ModelIdInputProps> = ({ initialValue, onChange }) => {
  const [localValue, setLocalValue] = useState(initialValue);

  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  return (
    <input
      type="text"
      value={localValue}
      onChange={e => setLocalValue(e.target.value)}
      onBlur={() => onChange(localValue)}
      placeholder="Model ID"
      className="model-id-input"
    />
  );
};
