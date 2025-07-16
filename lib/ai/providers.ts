import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
// import { createGateway } from '@ai-sdk/gateway';
// import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createGroq } from '@ai-sdk/groq';

import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// const openrouter = createOpenRouter({
//   apiKey: process.env.OPENROUTER_API_KEY,
// });

// const gateway = createGateway({
//   apiKey: process.env.AI_GATEWAY, // Use the AI Gateway API key from environment
// });

const modelName = `moonshotai/kimi-k2-instruct`;

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
        'chat-model': groq(modelName),
        'chat-model-reasoning': wrapLanguageModel({
          model: groq(modelName),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': groq(modelName),
        'artifact-model': groq(modelName),
        'small-model': groq(modelName),
      },
    });
