import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { Fragment, EditorMode, EditorState } from '../../types/editor';

const initialState: EditorState = {
  fragments: [],
  selectedIndex: 0,
  mode: 'explore',
  currentEditText: '',
  insertedSuggestions: [],
  generationPending: false
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    markSuggestionInserted: (state, action: PayloadAction<number>) => {
      if (!state.insertedSuggestions.includes(action.payload)) {
        state.insertedSuggestions.push(action.payload);
      }
    },    
    clearInsertedSuggestions: (state) => {
      state.insertedSuggestions = [];
    },
    setGenerationPending: (state, action: PayloadAction<boolean>) => {
      state.generationPending = action.payload;
    },
    insertSuggestion: (state, action: PayloadAction<{index: number, text: string}>) => {
      const { text } = action.payload;
      const insertIndex = state.selectedIndex + 1;
      
      // Create new fragment with the suggestion
      const newFragment: Fragment = {
        id: uuidv4(),
        text: text
      };
      
      // Insert the new fragment after the current selection
      state.fragments.splice(insertIndex, 0, newFragment);
      
      // Update selection to the new fragment
      state.selectedIndex = insertIndex;
    },    
    startInsert: (state, action: PayloadAction<number>) => {
        // Create new empty fragment at the specified index
        const newFragment: Fragment = {
          id: uuidv4(),
          text: '',
        };
        state.fragments.splice(action.payload, 0, newFragment);
        state.selectedIndex = action.payload;
        state.mode = 'insert';
        state.currentEditText = '';
    },
    deleteFragment: (state, action: PayloadAction<number>) => {
      state.fragments.splice(action.payload, 1);
      if (state.selectedIndex >= state.fragments.length) {
        state.selectedIndex = Math.max(0, state.fragments.length - 1);
      }
    },
    moveFragment: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [fragment] = state.fragments.splice(fromIndex, 1);
      state.fragments.splice(toIndex, 0, fragment);
      state.selectedIndex = toIndex;
    },
    setSelectedIndex: (state, action: PayloadAction<number>) => {
      state.selectedIndex = action.payload;
    },
    setMode: (state, action: PayloadAction<EditorMode>) => {
      state.mode = action.payload;
    },
    setCurrentEditText: (state, action: PayloadAction<string>) => {
      state.currentEditText = action.payload;
    },
    saveEdit: (state) => {
      if (state.selectedIndex < state.fragments.length) {
        state.fragments[state.selectedIndex].text = state.currentEditText;
      }
      state.mode = 'explore';
      state.currentEditText = '';
    },  
    cancelEdit: (state) => {
      if (state.mode === 'insert') {
        // Remove the empty fragment if we're cancelling an insert
        state.fragments.splice(state.selectedIndex, 1);
      }
      state.mode = 'explore';
      state.currentEditText = '';
    },
    clearEditor: (state) => {
      state.fragments = [];
      state.selectedIndex = 0;
      state.mode = 'explore';
      state.currentEditText = '';
      state.insertedSuggestions = [];
    },
    loadState: (state, action: PayloadAction<EditorState>) => {
        // Replace entire state with loaded state
        return action.payload;
    },
  }
});

export const {
  deleteFragment,
  moveFragment,
  setSelectedIndex,
  setMode,
  setCurrentEditText,
  saveEdit,
  cancelEdit,
  clearEditor,
  startInsert,
  loadState,
  insertSuggestion,
  markSuggestionInserted,
  clearInsertedSuggestions,
  setGenerationPending
} = editorSlice.actions;

export default editorSlice.reducer;
