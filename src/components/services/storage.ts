import { RootState } from '../../store/index';

export const StorageService = {
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
      const state = JSON.parse(text);
      // Basic validation that this is a valid state file
      if (state?.editor?.fragments !== undefined) {
        return state as RootState;
      }
      throw new Error('Invalid state file');
    } catch (err) {
      console.error('Could not import file:', err);
      alert('Error loading file: ' + (err instanceof Error ? err.message : 'Unknown error'));
      return undefined;
    }
  }
};