'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit3, Save, X, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileViewerProps {
  filePath: string;
  onClose: () => void;
  showCloseButton?: boolean;
}

export function FileViewer({ filePath, onClose, showCloseButton = true }: FileViewerProps) {
  const [content, setContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileName = filePath.split('/').pop() || '';
  const fileExtension = fileName.split('.').pop() || '';

  useEffect(() => {
    loadFileContent();
  }, [filePath]);

  const loadFileContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to read the file
      // For now, we'll simulate loading some content
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock file content based on file type
      const mockContent = getMockFileContent(filePath);
      setContent(mockContent);
      setEditedContent(mockContent);
    } catch (err) {
      setError('Failed to load file content');
      console.error('Error loading file:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMockFileContent = (path: string): string => {
    if (path.includes('layout.tsx')) {
      return `import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ChatLayout } from '@/components/chat-layout';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <ChatLayout>
        {children}
      </ChatLayout>
    </SidebarProvider>
  );
}`;
    } else if (path.includes('page.tsx')) {
      return `import { Chat } from '@/components/chat';

export default function Page() {
  return <Chat />;
}`;
    } else if (path.includes('.ts') || path.includes('.tsx')) {
      return `// TypeScript file: ${path}
export default function ${fileName.replace(/\.[^/.]+$/, "")}() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}`;
    } else if (path.includes('.json')) {
      return `{
  "name": "sample-file",
  "version": "1.0.0",
  "description": "Sample JSON file"
}`;
    } else {
      return `// File: ${path}
// This is a mock file content for demonstration
// In a real application, this would be loaded from the actual file system

console.log('Hello from ${fileName}');
`;
    }
  };

  const handleSave = async () => {
    try {
      // In a real app, this would be an API call to save the file
      await new Promise(resolve => setTimeout(resolve, 500));
      setContent(editedContent);
      setIsEditing(false);
      console.log('File saved:', filePath);
    } catch (err) {
      setError('Failed to save file');
      console.error('Error saving file:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const getLanguageFromExtension = (ext: string): string => {
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'md':
        return 'markdown';
      default:
        return 'text';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="font-medium">{fileName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading file...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="font-medium">{fileName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="font-medium">{fileName}</span>
          <Badge variant="secondary" className="text-xs">
            {getLanguageFromExtension(fileExtension)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                <X className="w-4 h-4" />
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
          {showCloseButton && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="h-full w-full resize-none border-0 rounded-none focus:ring-0 font-mono text-sm"
            placeholder="Edit file content..."
          />
        ) : (
          <ScrollArea className="h-full">
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
              {content}
            </pre>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
