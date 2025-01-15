import { SystemConfig, ModelConfig } from '../types/llm';

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  gridRows: 2,
  gridColumns: 4,
  systemPrompt: 'You are a creative writing assistant. Continue the story provided by the user.',
};

export const LocalStorageService = {
  saveSystemConfig(config: SystemConfig): void {
    localStorage.setItem('fragmentfrog_system', JSON.stringify(config));
  },

  loadSystemConfig(): SystemConfig {
    const stored = localStorage.getItem('fragmentfrog_system');
    if (!stored) return DEFAULT_SYSTEM_CONFIG;
    try {
      return JSON.parse(stored) as SystemConfig;
    } catch {
      return DEFAULT_SYSTEM_CONFIG;
    }
  },

  saveModelConfigs(configs: ModelConfig[]): void {
    localStorage.setItem('fragmentfrog_models', JSON.stringify(configs));
  },

  loadModelConfigs(): ModelConfig[] {
    const stored = localStorage.getItem('fragmentfrog_models');
    if (!stored) return [];
    try {
      return JSON.parse(stored) as ModelConfig[];
    } catch {
      return [];
    }
  }
};