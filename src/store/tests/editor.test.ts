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
  } from '../slices/editor';
  import { EditorState } from '../../types/editor';
  
  describe('editor reducer', () => {
    const initialState: EditorState = {
      fragments: [],
      selectedIndex: 0,
      mode: 'explore',
      currentEditText: '',
    };
  
    it('should handle initial state', () => {
      expect(editorReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  
    describe('insert mode', () => {
      it('should start insert mode with new empty fragment', () => {
        // Start with one existing fragment
        const stateWithFragment: EditorState = {
          ...initialState,
          fragments: [{ id: '1', text: 'existing fragment' }],
        };
  
        // Insert after the existing fragment
        const state = editorReducer(stateWithFragment, startInsert(1));
        
        expect(state.fragments.length).toBe(2);
        expect(state.fragments[1].text).toBe('');
        expect(state.selectedIndex).toBe(1);
        expect(state.mode).toBe('insert');
        expect(state.currentEditText).toBe('');
      });
  
      it('should handle saving in insert mode', () => {
        // Setup state as if we're in insert mode
        const insertState: EditorState = {
          fragments: [
            { id: '1', text: 'first' },
            { id: '2', text: '' }, // Empty fragment from startInsert
          ],
          selectedIndex: 1,
          mode: 'insert',
          currentEditText: 'new text',
        };
  
        const state = editorReducer(insertState, saveEdit());
        
        expect(state.fragments.length).toBe(2);
        expect(state.fragments[1].text).toBe('new text');
        expect(state.mode).toBe('explore');
        expect(state.currentEditText).toBe('');
      });
  
      it('should handle cancelling insert mode', () => {
        // Setup state as if we're in insert mode
        const insertState: EditorState = {
          fragments: [
            { id: '1', text: 'first' },
            { id: '2', text: '' }, // Empty fragment from startInsert
          ],
          selectedIndex: 1,
          mode: 'insert',
          currentEditText: 'unsaved text',
        };
  
        const state = editorReducer(insertState, cancelEdit());
        
        expect(state.fragments.length).toBe(1);
        expect(state.fragments[0].text).toBe('first');
        expect(state.mode).toBe('explore');
        expect(state.currentEditText).toBe('');
      });
  
      it('should handle insert at beginning', () => {
        const stateWithFragment: EditorState = {
          ...initialState,
          fragments: [{ id: '1', text: 'existing fragment' }],
        };
  
        const state = editorReducer(stateWithFragment, startInsert(0));
        
        expect(state.fragments.length).toBe(2);
        expect(state.fragments[0].text).toBe('');
        expect(state.fragments[1].text).toBe('existing fragment');
        expect(state.selectedIndex).toBe(0);
        expect(state.mode).toBe('insert');
      });
  
      it('should handle insert at end', () => {
        const stateWithFragment: EditorState = {
          ...initialState,
          fragments: [{ id: '1', text: 'existing fragment' }],
        };
  
        const state = editorReducer(stateWithFragment, startInsert(1));
        
        expect(state.fragments.length).toBe(2);
        expect(state.fragments[0].text).toBe('existing fragment');
        expect(state.fragments[1].text).toBe('');
        expect(state.selectedIndex).toBe(1);
        expect(state.mode).toBe('insert');
      });
    });
  
    // Existing tests for other actions...
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
  });