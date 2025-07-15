import 'server-only';

export interface APIFileNode {
  filename: string;
  fullPath: string;
  type: 'file' | 'directory';
  size: number;
  lastmod: string;
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  isOpen?: boolean;
  size?: number;
  lastModified?: string;
}

class FilesAPIService {
  private baseUrl: string;
  private token: string;
  private projectId: string;

  constructor(baseUrl: string, token: string, projectId: string) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.projectId = projectId;
  }

  async getDirectoryContents(path = '/'): Promise<APIFileNode[]> {
    try {
      // Clean the path - remove leading slash
      const cleanPath = path.replace(/^\//, '') || '/';

      const url = `${this.baseUrl}/files/${this.projectId}?path=${encodeURIComponent(cleanPath)}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contents = await response.json();
      return contents as APIFileNode[];
    } catch (error) {
      console.error('Error fetching directory contents:', error);
      throw error;
    }
  }

  async getFileContent(path: string): Promise<string> {
    try {
      // Clean the path - remove leading slash
      const cleanPath = path.replace(/^\//, '') || '/';

      const url = `${this.baseUrl}/files/${this.projectId}?path=${encodeURIComponent(cleanPath)}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      return content;
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw error;
    }
  }

  async buildFileTree(path = '/'): Promise<FileNode[]> {
    try {
      const contents = await this.getDirectoryContents(path);
      const tree = [];

      for (const item of contents) {
        const nodeType = item.type === 'directory' ? 'folder' : 'file';
        const node = {
          name: item.filename,
          type: nodeType,
          path: item.fullPath,
          size: item.size,
          lastModified: item.lastmod,
        } as FileNode;

        // For directories, we can optionally load children recursively
        // For now, we'll leave children undefined to load them on demand
        if (nodeType === 'folder') {
          node.children = [];
        }

        tree.push(node);
      }

      return tree.sort((a, b) => {
        // Sort folders first, then files
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error building file tree:', error);
      throw error;
    }
  }

  async loadFolderChildren(path: string): Promise<FileNode[]> {
    return this.buildFileTree(path);
  }

  async writeFile(path: string, content: string): Promise<void> {
    try {
      // Clean the path - remove leading slash
      const cleanPath = path.replace(/^\//, '') || '/';

      const url = `${this.baseUrl}/files/${this.projectId}?path=${encodeURIComponent(cleanPath)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'text/plain',
        },
        body: content,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error writing file content:', error);
      throw error;
    }
  }
}

// Store instances per project
const filesAPIInstances = new Map<string, FilesAPIService>();

export function getFilesAPIService(projectId: string): FilesAPIService {
  if (!filesAPIInstances.has(projectId)) {
    const baseUrl = process.env.FILES_API_BASE_URL;
    const token = process.env.PRISMA_MCP_KEY;

    console.log('Files API config:', { baseUrl, hasToken: !!token, projectId });

    if (!token) {
      throw new Error('PRISMA_MCP_KEY environment variable is required');
    }
    if (!baseUrl) {
      throw new Error('FILES_API_BASE_URL environment variable is required');
    }

    filesAPIInstances.set(projectId, new FilesAPIService(baseUrl, token, projectId));
  }

  const instance = filesAPIInstances.get(projectId);
  if (!instance) {
    throw new Error(`FilesAPIService instance not found for projectId: ${projectId}`);
  }
  return instance;
}

export { FilesAPIService };
