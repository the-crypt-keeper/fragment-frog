export interface SystemConfig {
    gridRows: number;
    gridColumns: number;
    systemPrompt: string;
  }
  
  export interface ModelConfig {
    id: string;
    model: string;
    tokenizer: string | null;
    temperature: number;
    stopAtPeriod: boolean;
    numCompletions: number;
    color: string;
    gridOffset: number;  // Starting position in the suggestion grid
  }
  
  export type ModelStatus = 'IDLE' | 'WAITING' | 'RUNNING' | 'ERROR';
  
  export interface Suggestion {
    text: string | null;
    inserted: boolean;
  }

  export interface CompletionUpdate {
    modelId: string;
    slotIndex: number;
    text: string;
    isComplete: boolean;
    error?: string;
  }
