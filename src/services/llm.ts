import { ModelConfig, CompletionUpdate } from '../types/llm';

export interface ModelInfo {
    id: string;
    created: number;
    owned_by: string;
}

export class LLMService {
  private static async* processStream(
    response: Response,
    modelId: string,
    baseSlotIndex: number
  ): AsyncGenerator<CompletionUpdate> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices && data.choices.length > 0) {
                for (const choice of data.choices) {
                  const slotIndex = baseSlotIndex + choice.index;
                  let text = choice.text;
                  if (choice.delta?.content) {
                    text = choice.delta.content;
                  }
                  
                  yield {
                    modelId,
                    slotIndex,
                    text: text || '',
                    isComplete: (choice.finish_reason !== null)
                  };
                }
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  static async* generateCompletions(
    configs: ModelConfig[],
    prompt: string,
    systemPrompt: string,
    signal: AbortSignal
  ): AsyncGenerator<CompletionUpdate> {
    const generators: AsyncGenerator<CompletionUpdate>[] = [];

    for (const config of configs) {
      let payload;
      if (config.tokenizer) {
        // Completion mode
        payload = {
          model: config.model,
          prompt: config.tokenizer
            .replace('{system}', systemPrompt)
            .replace('{prompt}', prompt),
          max_tokens: 50,
          temperature: config.temperature,
          top_p: 0.9,
          n: config.numCompletions,
          stop: config.stopAtPeriod ? ['.'] : undefined,
          stream: true,
        };
      } else {
        // Chat mode
        payload = {
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 50,
          temperature: config.temperature,
          top_p: 0.9,
          n: config.numCompletions,
          stop: config.stopAtPeriod ? ['.'] : undefined,
          stream: true,
        };
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_OPENAI_API_ENDPOINT}/${config.tokenizer ? 'v1/completions' : 'v1/chat/completions'}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
            },
            body: JSON.stringify(payload),
            signal
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        generators.push(this.processStream(response, config.id, config.gridOffset));
      } catch (error) {
        yield {
          modelId: config.id,
          slotIndex: config.gridOffset,
          text: '',
          isComplete: true,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Merge all streams
    while (generators.length > 0) {
      const results = await Promise.all(
        generators.map(g => g.next())
      );

      for (let i = results.length - 1; i >= 0; i--) {
        const result = results[i];
        if (result.done) {
          generators.splice(i, 1);
        } else {
          yield result.value;
        }
      }
    }
  }

  static async getAvailableModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_OPENAI_API_ENDPOINT}/v1/models`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data as ModelInfo[];
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }
}