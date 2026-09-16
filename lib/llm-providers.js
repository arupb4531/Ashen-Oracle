import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Gemini model fallback cascade — tries newest/fastest first, falls back automatically
const GEMINI_MODEL_CASCADE = [
  'gemini-3.6-flash',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

/**
 * Convert AI SDK v7 UI messages (with parts[]) to plain {role, content} format
 * that the language model providers expect.
 */
function normalizeMessages(messages) {
  return messages.map((m) => {
    // AI SDK v7 messages use parts[] for content
    if (m.parts && Array.isArray(m.parts)) {
      const textContent = m.parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text)
        .join('');
      return { role: m.role, content: textContent };
    }
    // Legacy format with content string
    return { role: m.role, content: m.content || '' };
  });
}

/**
 * Try each Gemini model in the cascade until one succeeds.
 * Returns the streamText result from the first model that doesn't throw.
 */
async function streamWithGeminiFallback(googleProvider, normalizedMessages, systemPrompt, modelConfig) {
  // If a specific model is requested via modelConfig, try it first
  const requestedModel = modelConfig?.model || process.env.GEMINI_MODEL;
  const cascade = requestedModel
    ? [requestedModel, ...GEMINI_MODEL_CASCADE.filter((m) => m !== requestedModel)]
    : GEMINI_MODEL_CASCADE;

  let lastError;
  for (const modelName of cascade) {
    try {
      const model = googleProvider(modelName);
      const result = streamText({
        model,
        messages: normalizedMessages,
        system: systemPrompt,
        temperature: modelConfig?.temperature || 0.7,
        maxTokens: modelConfig?.maxTokens || 2048,
      });
      // If we got here without throwing, return the result
      return result;
    } catch (err) {
      console.warn(`Gemini model "${modelName}" failed: ${err.message}. Trying next...`);
      lastError = err;
    }
  }
  throw lastError || new Error('All Gemini models in the cascade failed.');
}

export async function generateChatResponse(messages, systemPrompt, provider, modelConfig) {
  const normalizedMessages = normalizeMessages(messages);

  try {
    switch (provider) {
      case 'gemini': {
        if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured.');
        const googleProvider = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
        return await streamWithGeminiFallback(googleProvider, normalizedMessages, systemPrompt, modelConfig);
      }

      case 'groq': {
        if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured.');
        const groq = createOpenAI({
          baseURL: 'https://api.groq.com/openai/v1',
          apiKey: process.env.GROQ_API_KEY,
        });
        const model = groq(modelConfig?.model || process.env.GROQ_MODEL || 'llama-3.1-8b-instant');
        return streamText({
          model,
          messages: normalizedMessages,
          system: systemPrompt,
          temperature: modelConfig?.temperature || 0.7,
          maxTokens: modelConfig?.maxTokens || 2048,
        });
      }

      case 'openrouter': {
        if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured.');
        const openrouter = createOpenAI({
          baseURL: 'https://openrouter.ai/api/v1',
          apiKey: process.env.OPENROUTER_API_KEY,
        });
        const model = openrouter(modelConfig?.model || process.env.OPENROUTER_MODEL || 'openrouter/auto');
        return streamText({
          model,
          messages: normalizedMessages,
          system: systemPrompt,
          temperature: modelConfig?.temperature || 0.7,
          maxTokens: modelConfig?.maxTokens || 2048,
        });
      }

      case 'ollama': {
        const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api';
        const ollama = createOpenAI({
          baseURL: ollamaBaseUrl.replace('/api', '/v1'),
          apiKey: 'ollama',
        });
        const model = ollama(modelConfig?.model || process.env.OLLAMA_MODEL || 'llama3');
        return streamText({
          model,
          messages: normalizedMessages,
          system: systemPrompt,
          temperature: modelConfig?.temperature || 0.7,
          maxTokens: modelConfig?.maxTokens || 2048,
        });
      }

      case 'custom': {
        if (!process.env.CUSTOM_LLM_BASE_URL) throw new Error('CUSTOM_LLM_BASE_URL not configured.');
        const custom = createOpenAI({
          baseURL: process.env.CUSTOM_LLM_BASE_URL,
          apiKey: process.env.CUSTOM_LLM_API_KEY || 'custom',
        });
        const model = custom(modelConfig?.model || process.env.CUSTOM_LLM_MODEL || 'custom-model');
        return streamText({
          model,
          messages: normalizedMessages,
          system: systemPrompt,
          temperature: modelConfig?.temperature || 0.7,
          maxTokens: modelConfig?.maxTokens || 2048,
        });
      }

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error) {
    console.error('Provider Error:', error);
    throw error;
  }
}
