import React, { useEffect, useRef } from 'react';
import { Fragment } from './Fragment';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { setCurrentEditText } from '../store/slices/editor';
import { RootState } from '../store';
import './FragmentList.css';

export const FragmentList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { fragments, selectedIndex, mode, currentEditText } = useAppSelector(
    (state: RootState) => state.editor
  );
  const fragmentListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fragmentListRef.current) {
      const selectedElement = fragmentListRef.current.querySelector('.fragment.selected');
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="fragment-list" ref={fragmentListRef}>
      {fragments.map((fragment, index) => (
        <Fragment
          key={fragment.id}
          text={fragment.text}
          isSelected={index === selectedIndex}
          isEditing={mode !== 'explore' && index === selectedIndex}
          editValue={mode !== 'explore' && index === selectedIndex ? currentEditText : undefined}
          onEditChange={(value) => dispatch(setCurrentEditText(value))}
        />
      ))}
      <Fragment
        text="<new>"
        isSelected={selectedIndex === fragments.length}
        isEditing={mode === 'insert' && selectedIndex === fragments.length}
        isNew={true}
        editValue={mode === 'insert' && selectedIndex === fragments.length ? currentEditText : undefined}
        onEditChange={(value) => dispatch(setCurrentEditText(value))}
      />
    </div>
  );
};
