import type { Tool } from 'ai';

/**
 * Validates tool input parameters against the tool's schema
 */
function validateToolInput(
  toolName: string,
  input: any,
  schema: any,
): { isValid: boolean; error?: string } {
  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      error: `Tool ${toolName} requires input parameters`,
    };
  }

  // Check for specific tool requirements
  if (toolName === 'file_edit_diff') {
    const requiredParams = ['projectId', 'filename', 'diffContent'];
    const missingParams = requiredParams.filter((param) => !input[param]);

    if (missingParams.length > 0) {
      return {
        isValid: false,
        error: `Tool file_edit_diff is missing required parameters: ${missingParams.join(', ')}`,
      };
    }
  }

  // For other tools, check if schema exists and has required properties
  if (schema?.properties) {
    const requiredProps = schema.required || [];
    const missingProps = requiredProps.filter(
      (prop: string) => input[prop] === undefined,
    );

    if (missingProps.length > 0) {
      return {
        isValid: false,
        error: `Tool ${toolName} is missing required parameters: ${missingProps.join(', ')}`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Wraps a tool with validation logic
 */
export function wrapToolWithValidation(
  toolName: string,
  tool: Tool<any, any>,
): Tool<any, any> {
  return {
    ...tool,
    execute: async (input: any, context?: any) => {
      // Validate input parameters
      const validation = validateToolInput(toolName, input, tool.inputSchema);

      if (!validation.isValid) {
        console.warn(
          `Tool validation failed for ${toolName}:`,
          validation.error,
        );

        // Return an error message that the model can see and react to
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: ${validation.error}. Please provide all required parameters and try again.`,
            },
          ],
        };
      }

      // If validation passes, execute the original tool
      try {
        if (!tool.execute) {
          throw new Error(`Tool ${toolName} does not have an execute method`);
        }
        return await tool.execute(input, context);
      } catch (error) {
        console.error(`Tool execution failed for ${toolName}:`, error);
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error executing ${toolName}: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your parameters and try again.`,
            },
          ],
        };
      }
    },
  };
}

/**
 * Wraps all tools in an object with validation
 */
export function wrapToolsWithValidation(
  tools: Record<string, Tool<any, any>>,
): Record<string, Tool<any, any>> {
  const wrappedTools: Record<string, Tool<any, any>> = {};

  for (const [toolName, tool] of Object.entries(tools)) {
    wrappedTools[toolName] = wrapToolWithValidation(toolName, tool);
  }

  return wrappedTools;
}
