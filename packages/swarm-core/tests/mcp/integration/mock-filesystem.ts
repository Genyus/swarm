import { vi } from 'vitest';
import { IntegrationTestEnvironment } from './setup.js';

export interface MockFileSystemResult {
  success: boolean;
  contents?: string;
  entries?: Array<{ name: string; isDirectory: boolean; size: number }>;
  rollbackToken?: string;
  backupPath?: string;
  error?: string;
}

export class MockFileSystem {
  private testEnv: IntegrationTestEnvironment;

  constructor(testEnv: IntegrationTestEnvironment) {
    this.testEnv = testEnv;
  }

  async readFile(uri: string): Promise<MockFileSystemResult> {
    try {
      const contents = await this.testEnv.readFile(uri);
      return {
        success: true,
        contents,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async writeFile(
    uri: string,
    contents: string,
    backup: boolean = false
  ): Promise<MockFileSystemResult> {
    try {
      await this.testEnv.addFile(uri, contents);

      const rollbackToken = backup ? `mock-token-${Date.now()}` : '';

      return {
        success: true,
        rollbackToken,
        backupPath: backup ? `.mcp_backups/${rollbackToken}` : '',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async listDirectory(uri: string): Promise<MockFileSystemResult> {
    try {
      const files = await this.testEnv.listFiles(uri);
      const entries = files.map((name) => ({
        name,
        isDirectory: name.includes('.') ? false : true,
        size: 0,
      }));

      return {
        success: true,
        entries,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async deleteFile(
    _uri: string,
    backup: boolean = false
  ): Promise<MockFileSystemResult> {
    try {
      // In a real implementation, we'd need to handle deletion
      // For now, we'll just return success
      const rollbackToken = backup ? `mock-delete-token-${Date.now()}` : '';

      return {
        success: true,
        rollbackToken,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async rollback(): Promise<MockFileSystemResult> {
    // Mock rollback - in a real implementation, this would restore the file
    return {
      success: true,
    };
  }
}

export function mockFileSystemTools(testEnv: IntegrationTestEnvironment) {
  const mockFS = new MockFileSystem(testEnv);

  vi.mock('../../src/server/tools/filesystem.js', () => ({
    readFile: vi.fn((params: any) => mockFS.readFile(params.uri)),
    writeFile: vi.fn((params: any) =>
      mockFS.writeFile(params.uri, params.contents, params.backup)
    ),
    listDirectory: vi.fn((params: any) => mockFS.listDirectory(params.uri)),
    deleteFile: vi.fn((params: any) =>
      mockFS.deleteFile(params.uri, params.backup)
    ),
    rollback: vi.fn(() => mockFS.rollback()),
  }));

  return mockFS;
}
