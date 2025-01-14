export interface Fragment {
  id: string;
  text: string;
}

export type EditorMode = 'explore' | 'edit' | 'insert';

export interface EditorState {
  fragments: Fragment[];
  selectedIndex: number;
  mode: EditorMode;
  currentEditText: string;
  generationPending: boolean;
}
