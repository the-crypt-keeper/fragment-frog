import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  setSelectedIndex,
  moveFragment,
  deleteFragment,
  setMode,
  setCurrentEditText,
  startInsert,
  saveEdit,
  cancelEdit,
} from '../store/slices/editor';

export const useKeyboardControls = () => {
  const dispatch = useAppDispatch();
  const { fragments, selectedIndex, mode, currentEditText } = useAppSelector(
    (state) => state.editor
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (mode === 'explore') {
        switch (e.key) {
          case 'ArrowLeft':
            if (e.ctrlKey) {
              if (selectedIndex > 0) {
                dispatch(moveFragment({ 
                  fromIndex: selectedIndex, 
                  toIndex: selectedIndex - 1 
                }));
              }
            } else {
              dispatch(setSelectedIndex(Math.max(0, selectedIndex - 1)));
            }
            e.preventDefault();
            break;

          case 'ArrowRight':
            if (e.ctrlKey) {
              if (selectedIndex < fragments.length - 1) {
                dispatch(moveFragment({ 
                  fromIndex: selectedIndex, 
                  toIndex: selectedIndex + 1 
                }));
              }
            } else {
              dispatch(setSelectedIndex(Math.min(fragments.length, selectedIndex + 1)));
            }
            e.preventDefault();
            break;

        case ' ':
            e.preventDefault();
            if (selectedIndex === fragments.length) {
                // If we're on the <new> element, treat space like insert
                dispatch(startInsert(selectedIndex));
            } else {
                // Otherwise, go into edit mode
                dispatch(setCurrentEditText(fragments[selectedIndex].text));
                dispatch(setMode('edit'));
            }
            break;

          case 'd':
            dispatch(deleteFragment(selectedIndex));
            e.preventDefault();
            break;

          case 'i':
            dispatch(startInsert(selectedIndex + 1));
            e.preventDefault();
            break;
        }
      } else if (mode === 'edit' || mode === 'insert') {
        switch (e.key) {
          case 'Enter':
            if (e.ctrlKey) {
              // Insert newline
              const pos = (e.target as HTMLTextAreaElement).selectionStart;
              const newText = 
                currentEditText.slice(0, pos) + '\n' + 
                currentEditText.slice(pos);
              dispatch(setCurrentEditText(newText));
            } else {
              // Save changes
              dispatch(saveEdit());
            }
            e.preventDefault();
            break;

          case 'Escape':
            dispatch(cancelEdit());
            e.preventDefault();
            break;
        }
      }
    },
    [dispatch, fragments, selectedIndex, mode, currentEditText]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};