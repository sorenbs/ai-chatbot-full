'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit3, Save, X, Eye } from 'lucide-react';
import { getFilesClient } from '@/lib/files-client';
import { useProject } from '@/lib/project-context';

interface FileViewerProps {
  filePath: string;
  onClose: () => void;
  showCloseButton?: boolean;
}

export function FileViewer({
  filePath,
  onClose,
  showCloseButton = true,
}: FileViewerProps) {
  const [content, setContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { projectId } = useProject();

  const fileName = filePath.split('/').pop() || '';
  const fileExtension = fileName.split('.').pop() || '';

  const loadFileContent = useCallback(async () => {
    if (!projectId) {
      setError('No project selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filesClient = getFilesClient();
      filesClient.setProjectId(projectId);
      const fileContent = await filesClient.getFileContent(filePath);

      setContent(fileContent);
      setEditedContent(fileContent);
    } catch (err) {
      setError('Failed to load file content');
      console.error('Error loading file:', err);
    } finally {
      setLoading(false);
    }
  }, [filePath, projectId]);

  useEffect(() => {
    loadFileContent();
  }, [loadFileContent]);

  const handleSave = async () => {
    if (!projectId) {
      setError('No project selected');
      return;
    }

    try {
      const filesClient = getFilesClient();
      filesClient.setProjectId(projectId);
      await filesClient.writeFile(filePath, editedContent);
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
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
