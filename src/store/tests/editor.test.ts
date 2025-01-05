import editorReducer, {
    insertFragment,
    deleteFragment,
    moveFragment,
    setSelectedIndex,
    setMode,
    setCurrentEditText,
    saveEdit,
    cancelEdit,
    clearEditor,
  } from '../slices/editor';
  
  describe('editor reducer', () => {
    const initialState = {
      fragments: [],
      selectedIndex: 0,
      mode: 'explore' as const,
      currentEditText: '',
    };
  
    it('should handle initial state', () => {
      expect(editorReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  
    it('should handle insertFragment', () => {
      const actual = editorReducer(initialState, 
        insertFragment({ index: 0, text: 'test' })
      );
      expect(actual.fragments.length).toBe(1);
      expect(actual.fragments[0].text).toBe('test');
    });
  
    it('should handle deleteFragment', () => {
      const state = {
        ...initialState,
        fragments: [{ id: '1', text: 'test' }],
      };
      const actual = editorReducer(state, deleteFragment(0));
      expect(actual.fragments.length).toBe(0);
    });
  
    // Add more tests for other actions...
  });