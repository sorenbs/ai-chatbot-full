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
    
    // Check for existing messages on mount to handle direct URL navigation
    const checkForExistingMessages = () => {
      // Dispatch a custom event to request current message state
      window.dispatchEvent(new CustomEvent('chat-messages-check'));
    };

    // Small delay to ensure chat component has mounted
    const timeoutId = setTimeout(checkForExistingMessages, 100);
    
    return () => {
      window.removeEventListener('chat-messages-changed', handleMessagesChange as EventListener);
      clearTimeout(timeoutId);
    };
  }, []);

  return <ResizableLayout hasMessages={hasMessages}>{children}</ResizableLayout>;
}
