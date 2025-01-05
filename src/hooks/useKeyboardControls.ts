import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';

import { LLMService } from '../services/llm';
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
  clearInsertedSuggestions
} from '../store/slices/editor';
import { 
  setModelStatus, 
  setModelError, 
  setSuggestion,
  clearSuggestions 
} from '../store/slices/llm';

export const useKeyboardControls = () => {
  const dispatch = useAppDispatch();
  const { 
    fragments, 
    selectedIndex, 
    mode,
    currentEditText
  } = useAppSelector(state => state.editor);
  const { 
    systemConfig, 
    models, 
    suggestions 
  } = useAppSelector(state => state.llm);

  const generateSuggestions = useCallback(async () => {
    // Clear previous suggestions
    dispatch(clearSuggestions());
    dispatch(clearInsertedSuggestions());

    // Get context from current fragments
    const context = fragments
      .slice(0, selectedIndex + 1)
      .map(f => f.text)
      .join('');

    // Set all models to waiting
    models.forEach(model => {
      dispatch(setModelStatus({ modelId: model.id, status: 'WAITING' }));
    });

    const abortController = new AbortController();

    try {
      const generator = LLMService.generateCompletions(
        models,
        context,
        systemConfig.systemPrompt,
        abortController.signal
      );

      for await (const update of generator) {
        console.log('Received update:', update);
        
        if (update.error) {
          console.error('Model error:', update.modelId, update.error);
          dispatch(setModelError({ 
            modelId: update.modelId, 
            error: update.error 
          }));
        } else {
          console.log('Setting suggestion:', update.slotIndex, update.text);
          dispatch(setSuggestion({ 
            index: update.slotIndex, 
            text: update.text 
          }));
          
          if (update.isComplete) {
            console.log('Model complete:', update.modelId);
            dispatch(setModelStatus({ 
              modelId: update.modelId, 
              status: 'IDLE' 
            }));
          } else {
            console.log('Model running:', update.modelId);
            dispatch(setModelStatus({ 
              modelId: update.modelId, 
              status: 'RUNNING' 
            }));
          }
        }
      }
    } catch (error) {
      models.forEach(model => {
        dispatch(setModelError({ 
          modelId: model.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }));
      });
    }
  }, [dispatch, fragments, selectedIndex, models, systemConfig]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (mode === 'explore') {
        const totalSlots = systemConfig.gridRows * systemConfig.gridColumns;

        switch (e.key) {
          case 'Tab':
            e.preventDefault();
            generateSuggestions();
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
              dispatch(markSuggestionInserted(suggestionIndex));
              dispatch(insertSuggestion({
                index: suggestionIndex,
                text: suggestions[suggestionIndex] || ''
              }));
              
              // Generate new suggestions unless Ctrl is held
              if (!e.ctrlKey) {
                generateSuggestions();
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
    [dispatch, generateSuggestions, fragments, selectedIndex, mode, currentEditText, suggestions, systemConfig]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
