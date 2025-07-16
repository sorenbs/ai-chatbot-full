'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileViewer } from '@/components/file-viewer';
import { cn } from '@/lib/utils';
import { getFilesClient, type FileNode } from '@/lib/files-client';
import { useProject } from '@/lib/project-context';

export function FilesTab() {
  const [expandedFolders, setExpandedFolders] = useState(new Set<string>());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { projectId } = useProject();

  const loadFileTree = useCallback(async () => {
    if (!projectId) {
      setError('No project selected');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const filesClient = getFilesClient();
      filesClient.setProjectId(projectId);
      const tree = await filesClient.buildFileTree();
      setFileTree(tree);
    } catch (err) {
      // Silently handle errors and show empty list instead
      setFileTree([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const loadFolderChildren = async (path: string) => {
    if (!projectId) {
      setError('No project selected');
      return;
    }

    try {
      const filesClient = getFilesClient();
      filesClient.setProjectId(projectId);
      const children = await filesClient.loadFolderChildren(path);

      setFileTree((prev) => {
        const updateNode = (nodes: FileNode[]): FileNode[] => {
          return nodes.map((node) => {
            if (node.path === path && node.type === 'folder') {
              return { ...node, children };
            }
            if (node.children) {
              return { ...node, children: updateNode(node.children) };
            }
            return node;
          });
        };
        return updateNode(prev);
      });
    } catch (err) {
      // Silently handle folder loading errors
      console.warn('Failed to load folder contents:', err);
    }
  };

  const toggleFolder = async (path: string) => {
    const isExpanded = expandedFolders.has(path);

    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (isExpanded) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });

    if (!isExpanded) {
      // Load folder contents if not already loaded
      const folderNode = findNodeByPath(fileTree, path);
      if (
        folderNode &&
        folderNode.type === 'folder' &&
        (!folderNode.children || folderNode.children.length === 0)
      ) {
        await loadFolderChildren(path);
      }
    }
  };

  const findNodeByPath = (nodes: FileNode[], path: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path) {
        return node;
      }
      if (node.children) {
        const found = findNodeByPath(node.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  const handleFileSelect = (path: string, type: 'file' | 'folder') => {
    if (type === 'file') {
      setSelectedFile(selectedFile === path ? null : path);
    } else {
      toggleFolder(path);
    }
  };

  useEffect(() => {
    loadFileTree();
  }, [loadFileTree]);

  const renderFileNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path);

    return (
      <div key={node.path}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-sm h-8 px-2 hover:bg-muted',
            depth > 0 && `ml-${depth * 4}`,
            selectedFile === node.path && node.type === 'file' && 'bg-muted',
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleFileSelect(node.path, node.type)}
        >
          {node.type === 'folder' ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 mr-2" />
              ) : (
                <Folder className="w-4 h-4 mr-2" />
              )}
            </>
          ) : (
            <>
              <div className="w-4 h-4 mr-1" />
              <FileText className="w-4 h-4 mr-2" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </Button>

        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex">
      {/* File tree on the left */}
      <div
        className={cn(
          'flex flex-col border-r border-border transition-all duration-200',
          selectedFile ? 'w-1/3 min-w-[200px]' : 'w-full',
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-medium">Project Files</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadFileTree}
            disabled={loading}
          >
            <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {loading && fileTree.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">
                Loading files...
              </div>
            )}
            {fileTree.map((node) => renderFileNode(node))}
          </div>
        </ScrollArea>
      </div>

      {/* File viewer on the right */}
      {selectedFile && (
        <div className="flex-1 min-w-0">
          <FileViewer
            filePath={selectedFile}
            onClose={() => setSelectedFile(null)}
            showCloseButton={false}
          />
        </div>
      )}
    </div>
  );
}
