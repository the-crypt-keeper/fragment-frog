import { configureStore } from '@reduxjs/toolkit';
import editorReducer from './slices/editor';
import llmReducer from './slices/llm';

export const store = configureStore({
  reducer: {
    editor: editorReducer,
    llm: llmReducer,
  },
  // Enable Redux DevTools for easier debugging
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;