import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SystemConfig, ModelConfig, ModelStatus, Suggestion } from '../../types/llm';
import { LocalStorageService } from '../../services/localStorage';

interface LLMState {
  systemConfig: SystemConfig;
  models: ModelConfig[];
  suggestions: Suggestion[];
  modelStatuses: Record<string, ModelStatus>;
  errors: Record<string, string>;
}

const initialState: LLMState = {
  systemConfig: LocalStorageService.loadSystemConfig(),
  models: LocalStorageService.loadModelConfigs(),
  suggestions: [],
  modelStatuses: {},
  errors: {},
};

const llmSlice = createSlice({
  name: 'llm',
  initialState,
  reducers: {
    updateSystemConfig: (state, action: PayloadAction<SystemConfig>) => {
      state.systemConfig = action.payload;
      LocalStorageService.saveSystemConfig(action.payload);
      // Reset suggestions array size
      state.suggestions = new Array(action.payload.gridRows * action.payload.gridColumns).fill(null);
    },

    updateModelConfigs: (state, action: PayloadAction<ModelConfig[]>) => {
      state.models = action.payload;
      LocalStorageService.saveModelConfigs(action.payload);
      // Reset all statuses and errors
      state.modelStatuses = {};
      state.errors = {};
    },

    setSuggestion: (state, action: PayloadAction<{index: number, text: string | null, modelId: string}>) => {
      const { index, text, modelId } = action.payload;
      if (index < state.suggestions.length) {
        const currentSuggestion = state.suggestions[index]?.text ?? '';
        state.suggestions[index] = {
          text: (currentSuggestion) + (text ?? ''),
          inserted: false,
          modelId
        };
      }
    },

    markSuggestionInserted: (state, action: PayloadAction<number>) => {
      const { payload: index } = action;
      if (index < state.suggestions.length && state.suggestions[index]) {
        state.suggestions[index].inserted = true;
      }
    },

    setModelStatus: (state, action: PayloadAction<{modelId: string, status: ModelStatus}>) => {
      const { modelId, status } = action.payload;
      state.modelStatuses[modelId] = status;
      if (status !== 'ERROR') {
        delete state.errors[modelId];
      }
    },

    setModelError: (state, action: PayloadAction<{modelId: string, error: string}>) => {
      const { modelId, error } = action.payload;
      state.errors[modelId] = error;
      state.modelStatuses[modelId] = 'ERROR';
    },

    clearSuggestions: (state) => {
      state.suggestions = new Array(state.systemConfig.gridRows * state.systemConfig.gridColumns)
        .fill(null)
        .map(() => ({ text: null, inserted: false, modelId: null }));
      state.modelStatuses = {};
      state.errors = {};
    }
  }
});

export const {
  updateSystemConfig,
  updateModelConfigs,
  setSuggestion,
  setModelStatus,
  setModelError,
  clearSuggestions,
  markSuggestionInserted
} = llmSlice.actions;

export default llmSlice.reducer;
