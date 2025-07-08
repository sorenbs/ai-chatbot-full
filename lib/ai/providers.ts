import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY, // Use the AI Gateway API key from environment
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': gateway('anthropic/claude-4-sonnet'),
        'chat-model-reasoning': wrapLanguageModel({
          model: gateway('anthropic/claude-4-sonnet'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': gateway('anthropic/claude-4-sonnet'),
        'artifact-model': gateway('anthropic/claude-4-sonnet'),
        'small-model': gateway('anthropic/claude-4-sonnet'),
      },
    });
