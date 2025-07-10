import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import type { ChatMessage } from '@/lib/types';

interface CreateDocumentProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

export const returnToUser = tool({
  description:
    'When done working, or when requiring input from the user, call this tool.',
  inputSchema: z.object({
    request: z.string(),
  }),
});
