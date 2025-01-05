import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { Fragment, EditorMode, EditorState } from '../../types/editor';

const initialState: EditorState = {
  fragments: [],
  selectedIndex: 0,
  mode: 'explore',
  currentEditText: '',
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    insertFragment: (state, action: PayloadAction<{ index: number; text: string }>) => {
      const { index, text } = action.payload;
      const newFragment: Fragment = {
        id: uuidv4(),
        text,
      };
      state.fragments.splice(index, 0, newFragment);
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
      state.mode = 'explore';
      state.currentEditText = '';
    },
    clearEditor: (state) => {
      state.fragments = [];
      state.selectedIndex = 0;
      state.mode = 'explore';
      state.currentEditText = '';
    },
  },
});

export const {
  insertFragment,
  deleteFragment,
  moveFragment,
  setSelectedIndex,
  setMode,
  setCurrentEditText,
  saveEdit,
  cancelEdit,
  clearEditor,
} = editorSlice.actions;

export default editorSlice.reducer;