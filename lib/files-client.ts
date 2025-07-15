export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  isOpen?: boolean;
  size?: number;
  lastModified?: string;
}

class FilesClient {
  private projectId: string | null = null;

  setProjectId(projectId: string | null) {
    this.projectId = projectId;
  }

  async getFiles(path = '/'): Promise<FileNode[]> {
    if (!this.projectId) {
      throw new Error('Project ID is required but not set');
    }

    const response = await fetch(
      `/api/files/files?path=${encodeURIComponent(path)}&projectId=${encodeURIComponent(this.projectId)}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files;
  }

  async getFileContent(path: string): Promise<string> {
    if (!this.projectId) {
      throw new Error('Project ID is required but not set');
    }

    const response = await fetch(
      `/api/files/content?path=${encodeURIComponent(path)}&projectId=${encodeURIComponent(this.projectId)}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch file content: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content;
  }

  async buildFileTree(path = '/'): Promise<FileNode[]> {
    return this.getFiles(path);
  }

  async loadFolderChildren(path: string): Promise<FileNode[]> {
    return this.getFiles(path);
  }

  async writeFile(path: string, content: string): Promise<void> {
    if (!this.projectId) {
      throw new Error('Project ID is required but not set');
    }

    const response = await fetch('/api/files/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        content,
        projectId: this.projectId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to write file: ${response.statusText}`);
    }
  }
}

// Singleton instance
let filesClient: FilesClient | null = null;

export function getFilesClient(): FilesClient {
  if (!filesClient) {
    filesClient = new FilesClient();
  }

  return filesClient;
}

export { FilesClient };
