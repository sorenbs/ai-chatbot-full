'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilesTab } from './files-tab';
import { PreviewTab } from './preview-tab';
import { cn } from '@/lib/utils';


interface RightPanelProps {
  hasMessages?: boolean;
}

export function RightPanel({ hasMessages = false }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState('files');

  // Show a placeholder until there are messages
  if (!hasMessages) {
    return (
      <div className="h-full border-l border-border bg-background flex flex-col items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">Files & Preview</h3>
          <p className="text-sm">
            Start a conversation to see project files and preview here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full border-l border-border bg-background flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 w-full rounded-none border-b">
          <TabsTrigger 
            value="files" 
            className={cn(
              "rounded-none border-b-2 border-transparent",
              activeTab === 'files' && "border-primary"
            )}
          >
            Files
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            className={cn(
              "rounded-none border-b-2 border-transparent",
              activeTab === 'preview' && "border-primary"
            )}
          >
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="files" className="flex-1 mt-0 p-0">
          <FilesTab />
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 mt-0 p-0">
          <PreviewTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
