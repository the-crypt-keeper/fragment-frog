import React from 'react';
import './Fragment.css';

interface FragmentProps {
  text: string;
  isSelected: boolean;
  isEditing: boolean;
  isNew?: boolean;
  editValue?: string;
  onEditChange?: (value: string) => void;
}

export const Fragment: React.FC<FragmentProps> = ({
  text,
  isSelected,
  isEditing,
  isNew = false,
  editValue,
  onEditChange,
}) => {
  // Function to process text for display
  const processText = (text: string) => {
    if (!text) return '<empty>';
    if (text.startsWith('\n')) return text.replaceAll('\n','↵ \n');
    return text;
  };

  if (isEditing) {
    return (
      <span className={`fragment editing ${isNew ? 'new' : ''}`}>
        <textarea
          value={editValue}
          onChange={(e) => onEditChange?.(e.target.value)}
          autoFocus
        />
      </span>
    );
  }

  return (
    <span className={`fragment ${isSelected ? 'selected' : ''} ${isNew ? 'new' : ''}`}>
      {processText(text)}
    </span>
  );
};