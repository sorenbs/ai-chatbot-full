import { convertToModelMessages as originalConvertToModelMessages } from 'ai';
import type { ChatMessage } from '@/lib/types';

/**
 * Safe wrapper around convertToModelMessages that handles malformed tool calls
 * by filtering them out instead of throwing an error.
 */
export function safeConvertToModelMessages(uiMessages: ChatMessage[]) {
  try {
    return originalConvertToModelMessages(uiMessages, {
      ignoreIncompleteToolCalls: true,
    });
  } catch (error) {
    // Handle malformed tool calls by filtering them out
    if (
      error instanceof Error &&
      error.message.includes('incomplete tool input')
    ) {
      console.warn('Filtering out malformed tool calls from message history');

      const filteredMessages = uiMessages.map((message) => {
        if (message.role === 'assistant' && message.parts) {
          // Filter out malformed tool calls from assistant messages
          const validParts = message.parts.filter((part) => {
            if (
              part.type?.includes('tool-') &&
              ((part as any).state === 'input-streaming' ||
                (part as any).state === 'input-available')
            ) {
              // Check if tool call has required parameters
              const toolCall = part as any;
              if (!toolCall.input || typeof toolCall.input !== 'object') {
                console.warn(
                  `Filtering malformed tool call: ${toolCall.toolCallId}`,
                );
                return false;
              }

              // For file_edit_diff, we need at least filename and diff
              if (part.type === 'tool-file_edit_diff') {
                const hasRequiredParams =
                  toolCall.input.filename &&
                  (toolCall.input.diff || toolCall.input.content);
                if (!hasRequiredParams) {
                  console.warn(
                    `Filtering incomplete file_edit_diff: ${toolCall.toolCallId}`,
                  );
                  return false;
                }
              }
            }
            return true;
          });

          return {
            ...message,
            parts: validParts,
          };
        }
        return message;
      });

      // Try again with filtered messages
      return originalConvertToModelMessages(filteredMessages, {
        ignoreIncompleteToolCalls: true,
      });
    }

    // Re-throw other errors
    throw error;
  }
}
