'use client';

import { useState } from 'react';
import { FileText, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileViewer } from '@/components/file-viewer';
import { cn } from '@/lib/utils';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  isOpen?: boolean;
}

// Sample file tree data - in a real app, this would come from an API
const fileTree: FileNode[] = [
  {
    name: 'app',
    type: 'folder',
    path: 'app',
    isOpen: true,
    children: [
      {
        name: '(auth)',
        type: 'folder',
        path: 'app/(auth)',
        children: [
          { name: 'auth.ts', type: 'file', path: 'app/(auth)/auth.ts' },
          { name: 'login', type: 'folder', path: 'app/(auth)/login', children: [] },
        ],
      },
      {
        name: '(chat)',
        type: 'folder',
        path: 'app/(chat)',
        isOpen: true,
        children: [
          { name: 'layout.tsx', type: 'file', path: 'app/(chat)/layout.tsx' },
          { name: 'page.tsx', type: 'file', path: 'app/(chat)/page.tsx' },
          {
            name: 'api',
            type: 'folder',
            path: 'app/(chat)/api',
            children: [
              {
                name: 'chat',
                type: 'folder',
                path: 'app/(chat)/api/chat',
                children: [
                  { name: 'route.ts', type: 'file', path: 'app/(chat)/api/chat/route.ts' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'components',
    type: 'folder',
    path: 'components',
    isOpen: true,
    children: [
      { name: 'app-sidebar.tsx', type: 'file', path: 'components/app-sidebar.tsx' },
      { name: 'right-panel.tsx', type: 'file', path: 'components/right-panel.tsx' },
      { name: 'files-tab.tsx', type: 'file', path: 'components/files-tab.tsx' },
      {
        name: 'ui',
        type: 'folder',
        path: 'components/ui',
        children: [
          { name: 'button.tsx', type: 'file', path: 'components/ui/button.tsx' },
          { name: 'sidebar.tsx', type: 'file', path: 'components/ui/sidebar.tsx' },
          { name: 'tabs.tsx', type: 'file', path: 'components/ui/tabs.tsx' },
        ],
      },
    ],
  },
];

export function FilesTab() {
  const [expandedFolders, setExpandedFolders] = useState(
    new Set(['app', 'app/(chat)', 'components'])
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleFileSelect = (path: string, type: 'file' | 'folder') => {
    if (type === 'file') {
      setSelectedFile(selectedFile === path ? null : path);
    } else {
      toggleFolder(path);
    }
  };

  const renderFileNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    
    return (
      <div key={node.path}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sm h-8 px-2 hover:bg-muted",
            depth > 0 && `ml-${depth * 4}`,
            selectedFile === node.path && node.type === 'file' && "bg-muted"
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
            {node.children.map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex">
      {/* File tree on the left */}
      <div className={cn(
        "flex flex-col border-r border-border transition-all duration-200",
        selectedFile ? "w-1/3 min-w-[200px]" : "w-full"
      )}>
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium">Project Files</h3>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {fileTree.map(node => renderFileNode(node))}
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
