import { useCallback, useRef } from 'react';
import { useAppDispatch } from './redux';
import { LLMService } from '../services/llm';
import { ModelConfig } from '../types/llm';
import {
  setModelStatus,
  setModelError,
  setSuggestion,
  clearSuggestions
} from '../store/slices/llm';
import { clearInsertedSuggestions } from '../store/slices/editor';

export const useCompletion = () => {
  const dispatch = useAppDispatch();
  const abortControllersRef = useRef<Record<string, AbortController>>({});

  const generateCompletions = useCallback(async (
    models: ModelConfig[],
    context: string,
    systemPrompt: string
  ) => {
    // Clear previous suggestions and abort any ongoing requests
    dispatch(clearSuggestions());
    dispatch(clearInsertedSuggestions());
    
    Object.values(abortControllersRef.current).forEach(controller => {
      controller.abort();
    });
    abortControllersRef.current = {};

    // Start a new completion for each model independently
    models.forEach(async (model) => {
      const controller = new AbortController();
      abortControllersRef.current[model.id] = controller;
      
      dispatch(setModelStatus({ modelId: model.id, status: 'WAITING' }));

      try {
        const generator = LLMService.generateCompletion(
          model,
          context,
          systemPrompt,
          controller.signal
        );

        for await (const update of generator) {
          if (update.error) {
            dispatch(setModelError({ 
              modelId: update.modelId, 
              error: update.error 
            }));
          } else {
            dispatch(setSuggestion({ 
              index: update.slotIndex, 
              text: update.text 
            }));
            
            dispatch(setModelStatus({ 
              modelId: update.modelId, 
              status: update.isComplete ? 'IDLE' : 'RUNNING' 
            }));
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          // Ignore abort errors
          return;
        }
        dispatch(setModelError({ 
          modelId: model.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }));
      }
    });
  }, [dispatch]);

  return { generateCompletions };
};
