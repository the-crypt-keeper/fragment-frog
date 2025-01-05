// src/store/__tests__/llm.test.ts
import llmReducer, {
    updateSystemConfig,
    updateModelConfigs,
    setSuggestion,
    setModelStatus,
    setModelError,
    clearSuggestions
  } from '../slices/llm';
  import { SystemConfig, ModelConfig, ModelStatus } from '../../types/llm';
  
  describe('llm reducer', () => {
    const initialSystemConfig: SystemConfig = {
      gridRows: 2,
      gridColumns: 4,
      systemPrompt: 'You are a creative writing assistant. Continue the story provided by the user.',
    };
  
    const sampleModels: ModelConfig[] = [
      {
        id: 'model1',
        model: 'gpt-3.5-turbo',
        tokenizer: null,
        temperature: 1.0,
        stopAtPeriod: true,
        numCompletions: 4,
        color: '#e6f3ff',
        gridOffset: 0,
      },
      {
        id: 'model2',
        model: 'gpt-4',
        tokenizer: '### Instruction:\n{system}\n\n### Response:{prompt}',
        temperature: 0.7,
        stopAtPeriod: true,
        numCompletions: 4,
        color: '#fff0e6',
        gridOffset: 4,
      },
    ];
  
    const initialState = {
      systemConfig: initialSystemConfig,
      models: [],
      suggestions: [],
      modelStatuses: {},
      errors: {},
    };
  
    it('should handle initial state', () => {
      expect(llmReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  
    describe('system configuration', () => {
      it('should update system config', () => {
        const newConfig: SystemConfig = {
          gridRows: 3,
          gridColumns: 3,
          systemPrompt: 'New system prompt',
        };
  
        const state = llmReducer(
          initialState,
          updateSystemConfig(newConfig)
        );
  
        expect(state.systemConfig).toEqual(newConfig);
        expect(state.suggestions).toHaveLength(9); // 3x3 grid
      });
    });
  
    describe('model configuration', () => {
      it('should update model configs', () => {
        const state = llmReducer(
          initialState,
          updateModelConfigs(sampleModels)
        );
  
        expect(state.models).toEqual(sampleModels);
        expect(state.modelStatuses).toEqual({});
        expect(state.errors).toEqual({});
      });
    });
  
    describe('suggestion management', () => {
      it('should set suggestion at specific index', () => {
        const stateWithGrid = llmReducer(
          initialState,
          updateSystemConfig({
            ...initialSystemConfig,
            gridRows: 2,
            gridColumns: 2,
          })
        );
  
        const state = llmReducer(
          stateWithGrid,
          setSuggestion({ index: 0, text: 'New suggestion' })
        );
  
        expect(state.suggestions[0]).toBe('New suggestion');
        expect(state.suggestions).toHaveLength(4); // 2x2 grid
      });
  
      it('should clear all suggestions', () => {
        const stateWithSuggestions = {
          ...initialState,
          suggestions: ['suggestion1', 'suggestion2', 'suggestion3', 'suggestion4'],
        };
  
        const state = llmReducer(stateWithSuggestions, clearSuggestions());
  
        expect(state.suggestions).toEqual(
          new Array(initialSystemConfig.gridRows * initialSystemConfig.gridColumns).fill(null)
        );
      });
    });
  
    describe('model status management', () => {
      it('should set model status', () => {
        const status: ModelStatus = 'RUNNING';
        
        const state = llmReducer(
          initialState,
          setModelStatus({ modelId: 'model1', status })
        );
  
        expect(state.modelStatuses['model1']).toBe(status);
        expect(state.errors['model1']).toBeUndefined();
      });
  
      it('should clear error when setting non-error status', () => {
        const stateWithError = {
          ...initialState,
          modelStatuses: { model1: 'ERROR' },
          errors: { model1: 'Previous error' },
        };
  
        const state = llmReducer(
          stateWithError,
          setModelStatus({ modelId: 'model1', status: 'RUNNING' })
        );
  
        expect(state.modelStatuses['model1']).toBe('RUNNING');
        expect(state.errors['model1']).toBeUndefined();
      });
  
      it('should set model error', () => {
        const error = 'Test error message';
        
        const state = llmReducer(
          initialState,
          setModelError({ modelId: 'model1', error })
        );
  
        expect(state.errors['model1']).toBe(error);
        expect(state.modelStatuses['model1']).toBe('ERROR');
      });
    });
  
    describe('grid size changes', () => {
        it('should handle grid size increase', () => {
          const startState = {
            ...initialState,
            systemConfig: { ...initialSystemConfig, gridRows: 2, gridColumns: 2 },
            suggestions: ['1', '2', '3', '4'],
          };
    
          const state = llmReducer(
            startState,
            updateSystemConfig({ ...initialSystemConfig, gridRows: 2, gridColumns: 3 })
          );
    
          expect(state.suggestions).toHaveLength(6);
          expect(state.suggestions).toEqual([null, null, null, null, null, null]);
        });
    
        it('should handle grid size decrease', () => {
          const startState = {
            ...initialState,
            systemConfig: { ...initialSystemConfig, gridRows: 2, gridColumns: 3 },
            suggestions: ['1', '2', '3', '4', '5', '6'],
          };
    
          const state = llmReducer(
            startState,
            updateSystemConfig({ ...initialSystemConfig, gridRows: 2, gridColumns: 2 })
          );
    
          expect(state.suggestions).toHaveLength(4);
          expect(state.suggestions).toEqual([null, null, null, null]);
        });
      });
      
  });