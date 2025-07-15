'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProjectContextType {
  projectId: string | null;
  setProjectId: (id: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [projectId, setProjectId] = useState<string | null>(null);

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

// Helper function to extract projectId from application_create tool results
export function extractProjectIdFromToolResult(output: any): string | null {
  try {
    if (typeof output?.content?.[0]?.text === 'string') {
      const result = JSON.parse(output.content[0].text);
      return result.id || null;
    }
  } catch (error) {
    console.error('Failed to extract projectId from tool result:', error);
  }
  return null;
}
