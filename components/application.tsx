import { memo } from 'react';

interface ApplicationToolCallProps {
  args: { applicationName: string };
}

function PureApplicationToolCall({ args }: ApplicationToolCallProps) {
  return (
    <div className="p-3 border rounded-lg">
      Creating application: {args.applicationName}
    </div>
  );
}

export const ApplicationToolCall = memo(PureApplicationToolCall, () => true);

interface ApplicationToolResultProps {
  input: { applicationName: string };
  output: {
    content: Array<{ type: string; text: string }>;
  };
}

function PureApplicationToolResult({ input, output }: ApplicationToolResultProps) {
  let result: any;
  let isError = false;

  try {
    result = JSON.parse(output.content[0].text);
  } catch (error) {
    isError = true;
    result = { error: output.content[0].text };
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="size-2 bg-red-500 rounded-full" />
          <span className="text-red-800 font-medium">Application Error</span>
        </div>
        <div className="text-sm text-red-700 mb-2">
          <strong>Name:</strong> {input.applicationName}
        </div>
        <div className="text-sm text-red-700">
          <strong>Error:</strong> {result.error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <div className="size-2 bg-green-500 rounded-full" />
        <span className="text-green-800 font-medium">Application Created</span>
      </div>
      <div className="text-sm text-green-700 mb-2">
        <strong>Name:</strong> {input.applicationName}
      </div>
      <div className="text-sm text-green-700">
        <strong>URL:</strong> <a href={result.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-600">{result.url}</a>
      </div>
    </div>
  );
}

export const ApplicationToolResult = memo(PureApplicationToolResult, () => true);

// Generic grey box component for other tools
interface GenericToolCallProps {
  toolName: string;
  args: any;
}

function PureGenericToolCall({ toolName, args }: GenericToolCallProps) {
  return (
    <div className="p-3 border rounded-lg">
      {toolName}: {JSON.stringify(args)}
    </div>
  );
}

export const GenericToolCall = memo(PureGenericToolCall, () => true);

interface GenericToolResultProps {
  toolName: string;
  input: any;
  output: any;
}

function PureGenericToolResult({ toolName, input, output }: GenericToolResultProps) {
  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <div className="size-2 bg-gray-500 rounded-full" />
        <span className="text-gray-800 font-medium">{toolName}</span>
      </div>
      <div className="text-sm text-gray-700 mb-2">
        <strong>Input:</strong> <pre className="inline bg-gray-100 px-1 rounded">{JSON.stringify(input, null, 2)}</pre>
      </div>
      <div className="text-sm text-gray-700">
        <strong>Output:</strong> <pre className="inline bg-gray-100 px-1 rounded">{JSON.stringify(output, null, 2)}</pre>
      </div>
    </div>
  );
}

export const GenericToolResult = memo(PureGenericToolResult, () => true);
