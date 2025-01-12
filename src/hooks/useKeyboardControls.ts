import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { useCompletion } from './useCompletion';
import {
  setSelectedIndex,
  moveFragment,
  deleteFragment,
  setMode,
  setCurrentEditText,
  startInsert,
  saveEdit,
  cancelEdit,
  insertSuggestion,
  markSuggestionInserted,
  clearInsertedSuggestions,
  setGenerationPending
} from '../store/slices/editor';
import { 
  setModelStatus, 
  setModelError, 
  setSuggestion,
  clearSuggestions 
} from '../store/slices/llm';

export interface KeyboardControlsProps {
  isModalOpen?: boolean;
}

export const useKeyboardControls = ({ isModalOpen = false }: KeyboardControlsProps = {}) => {
  const dispatch = useAppDispatch();
  const { 
    fragments, 
    selectedIndex, 
    mode,
    currentEditText,
    generationPending
  } = useAppSelector(state => state.editor);
  const { 
    systemConfig, 
    models, 
    suggestions 
  } = useAppSelector(state => state.llm);

  const { generateCompletions } = useCompletion();

  const generateSuggestions = useCallback(async () => {
    const context = fragments
      .slice(0, selectedIndex + 1)
      .map(f => f.text)
      .join('');
      
    await generateCompletions(models, context, systemConfig.systemPrompt);
  }, [dispatch, fragments, selectedIndex, models, systemConfig]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (mode === 'explore') {
        const totalSlots = systemConfig.gridRows * systemConfig.gridColumns;

        switch (e.key) {
          case 'Tab':
            e.preventDefault();
            dispatch(setGenerationPending(true));
            break;
  
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9': {
            const suggestionIndex = parseInt(e.key) - 1;
            if (suggestionIndex < totalSlots && suggestions[suggestionIndex]) {
              e.preventDefault();
              // First insert the suggestion and mark it as inserted
              dispatch(markSuggestionInserted(suggestionIndex));
              dispatch(insertSuggestion({
                index: suggestionIndex,
                text: suggestions[suggestionIndex] || ''
              }));
              
              // Queue generation unless Ctrl is held
              if (!e.ctrlKey) {
                dispatch(setGenerationPending(true));
              }
            }
            break;
          }

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
            if (selectedIndex === fragments.length) {
                dispatch(startInsert(selectedIndex));
            } else {
                dispatch(startInsert(selectedIndex + 1));
            }
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
    [dispatch, fragments, selectedIndex, mode, currentEditText, suggestions, systemConfig]
  );

  useEffect(() => {
    if (!isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isModalOpen]);

  // Watch for pending generation flag
  useEffect(() => {
    if (mode === 'explore' && generationPending) {
      generateSuggestions();
      dispatch(setGenerationPending(false));
    }
  }, [dispatch, generateSuggestions, mode, generationPending]);
};
