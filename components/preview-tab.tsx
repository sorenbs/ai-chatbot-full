'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, ExternalLink, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PreviewTab() {
  const [url, setUrl] = useState('http://localhost:3000');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleOpenInBrowser = () => {
    window.open(url, '_blank');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Preview</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenInBrowser}
            className="h-8 w-8 p-0"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 h-8 text-xs"
            placeholder="Enter URL to preview"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <iframe
          src={url}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
}
