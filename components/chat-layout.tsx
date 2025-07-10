'use client';

import { useState, useEffect } from 'react';
import { ResizableLayout } from './resizable-layout';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const [hasMessages, setHasMessages] = useState(false);

  // Listen for custom events from the chat component
  useEffect(() => {
    const handleMessagesChange = (event: CustomEvent) => {
      setHasMessages(event.detail.hasMessages);
    };

    window.addEventListener('chat-messages-changed', handleMessagesChange as EventListener);
    
    return () => {
      window.removeEventListener('chat-messages-changed', handleMessagesChange as EventListener);
    };
  }, []);

  return <ResizableLayout hasMessages={hasMessages}>{children}</ResizableLayout>;
}
