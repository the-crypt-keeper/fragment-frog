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
    
    // Split on horizontal rule marker and process each part
    const parts = text.split('\n---\n');
    return parts.map((part, i) => (
      <React.Fragment key={i}>
        {i > 0 && <hr className="fragment-hr" />}
        {part.replaceAll('\n','↵ \n')}
      </React.Fragment>
    ));
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
