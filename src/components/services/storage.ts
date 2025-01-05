import { RootState } from '../../store/index';

export const StorageService = {
  saveState: (state: RootState): void => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('fragmentFrogState', serializedState);
    } catch (err) {
      console.error('Could not save state:', err);
    }
  },

  loadState: (): RootState | undefined => {
    try {
      const serializedState = localStorage.getItem('fragmentFrogState');
      if (!serializedState) return undefined;
      return JSON.parse(serializedState);
    } catch (err) {
      console.error('Could not load state:', err);
      return undefined;
    }
  },

  exportToFile: (state: RootState): void => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fragmentfrog-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importFromFile: async (file: File): Promise<RootState | undefined> => {
    try {
      const text = await file.text();
      return JSON.parse(text);
    } catch (err) {
      console.error('Could not import file:', err);
      return undefined;
    }
  }
};