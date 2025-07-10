'use client';

import * as React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { SidebarInset } from '@/components/ui/sidebar';
import { RightPanel } from '@/components/right-panel';

interface ResizableLayoutProps {
  children: React.ReactNode;
  hasMessages?: boolean;
}

export function ResizableLayout({ children, hasMessages = false }: ResizableLayoutProps) {
  return (
    <PanelGroup direction="horizontal" className="flex-1">
      <Panel defaultSize={70} minSize={30}>
        <SidebarInset className="h-full">{children}</SidebarInset>
      </Panel>
      
      <PanelResizeHandle className="w-2 bg-border hover:bg-muted transition-colors cursor-col-resize flex items-center justify-center group">
        <div className="w-1 h-8 bg-border-foreground/30 group-hover:bg-border-foreground/50 rounded-full transition-colors" />
      </PanelResizeHandle>
      
      <Panel defaultSize={30} minSize={20} maxSize={50}>
        <RightPanel hasMessages={hasMessages} />
      </Panel>
    </PanelGroup>
  );
}
