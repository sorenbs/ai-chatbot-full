import { experimental_createMCPClient } from 'ai';
import { z } from 'zod';

export async function prismaMCPClientAndTools() {
  const prismaClient = await experimental_createMCPClient({
    transport: {
      type: 'sse',
      url: `${process.env.PRISMA_MCP_URL}`,
      headers: {
        Authorization: `Bearer ${process.env.PRISMA_MCP_KEY}`,
      },
    },
  });

  const prismaTools = await prismaClient.tools();

  return { prismaClient, prismaTools };
}
