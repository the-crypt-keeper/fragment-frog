// src/store/__tests__/editor.test.ts
import editorReducer, {
  deleteFragment,
  moveFragment,
  setSelectedIndex,
  setMode,
  setCurrentEditText,
  saveEdit,
  cancelEdit,
  clearEditor,
  startInsert,
  insertSuggestion,
  markSuggestionInserted,
  clearInsertedSuggestions,
} from '../slices/editor';
import { EditorState } from '../../types/editor';
import { enableMapSet } from 'immer';

enableMapSet();

describe('editor reducer', () => {
  const initialState: EditorState = {
    fragments: [],
    selectedIndex: 0,
    mode: 'explore',
    currentEditText: '',
    insertedSuggestions: [],
    generationPending: false
  };

  it('should handle initial state', () => {
    expect(editorReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('suggestion handling', () => {
    it('should track inserted suggestions', () => {
      const state = editorReducer(
        initialState,
        markSuggestionInserted(0)
      );
  
      expect(state.insertedSuggestions).toContain(0);
    });
  
    it('should not duplicate inserted suggestions', () => {
      let state = editorReducer(
        initialState,
        markSuggestionInserted(0)
      );
      state = editorReducer(state, markSuggestionInserted(0));
  
      expect(state.insertedSuggestions.length).toBe(1);
      expect(state.insertedSuggestions).toContain(0);
    });
  
    it('should clear inserted suggestions', () => {
      let state = editorReducer(
        initialState,
        markSuggestionInserted(0)
      );
      state = editorReducer(state, markSuggestionInserted(1));
      state = editorReducer(state, clearInsertedSuggestions());
  
      expect(state.insertedSuggestions).toHaveLength(0);
    });
  });

  describe('insert mode', () => {
    it('should start insert mode with new empty fragment', () => {
      const stateWithFragment: EditorState = {
        ...initialState,
        fragments: [{ id: '1', text: 'existing fragment' }],
      };

      const state = editorReducer(stateWithFragment, startInsert(1));
      
      expect(state.fragments.length).toBe(2);
      expect(state.fragments[1].text).toBe('');
      expect(state.selectedIndex).toBe(1);
      expect(state.mode).toBe('insert');
      expect(state.currentEditText).toBe('');
    });

    it('should handle saving in insert mode', () => {
      const insertState: EditorState = {
        fragments: [
          { id: '1', text: 'first' },
          { id: '2', text: '' },
        ],
        selectedIndex: 1,
        mode: 'insert',
        currentEditText: 'new text',
        insertedSuggestions: new Set(),
      };

      const state = editorReducer(insertState, saveEdit());
      
      expect(state.fragments.length).toBe(2);
      expect(state.fragments[1].text).toBe('new text');
      expect(state.mode).toBe('explore');
      expect(state.currentEditText).toBe('');
    });

    it('should handle cancelling insert mode', () => {
      const insertState: EditorState = {
        fragments: [
          { id: '1', text: 'first' },
          { id: '2', text: '' },
        ],
        selectedIndex: 1,
        mode: 'insert',
        currentEditText: 'unsaved text',
        insertedSuggestions: new Set(),
      };

      const state = editorReducer(insertState, cancelEdit());
      
      expect(state.fragments.length).toBe(1);
      expect(state.fragments[0].text).toBe('first');
      expect(state.mode).toBe('explore');
      expect(state.currentEditText).toBe('');
    });
  });

  describe('basic fragment operations', () => {
    it('should handle deleteFragment', () => {
      const state = {
        ...initialState,
        fragments: [{ id: '1', text: 'test' }],
      };
      const actual = editorReducer(state, deleteFragment(0));
      expect(actual.fragments.length).toBe(0);
    });

    it('should handle moveFragment', () => {
      const state: EditorState = {
        ...initialState,
        fragments: [
          { id: '1', text: 'first' },
          { id: '2', text: 'second' },
        ],
      };
      
      const actual = editorReducer(
        state, 
        moveFragment({ fromIndex: 0, toIndex: 1 })
      );
      
      expect(actual.fragments[0].text).toBe('second');
      expect(actual.fragments[1].text).toBe('first');
      expect(actual.selectedIndex).toBe(1);
    });
  });

  describe('editor state management', () => {
    it('should clear editor state', () => {
      const state: EditorState = {
        fragments: [{ id: '1', text: 'test' }],
        selectedIndex: 0,
        mode: 'edit',
        currentEditText: 'editing',
        insertedSuggestions: [0, 1],
      };

      const actual = editorReducer(state, clearEditor());
      expect(actual).toEqual(initialState);
    });

    it('should handle mode changes', () => {
      const state = editorReducer(
        initialState,
        setMode('edit')
      );
      expect(state.mode).toBe('edit');
    });

    it('should update current edit text', () => {
      const state = editorReducer(
        initialState,
        setCurrentEditText('new text')
      );
      expect(state.currentEditText).toBe('new text');
    });
  });
});