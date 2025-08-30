import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteFile,
  listDirectory,
  readFile,
  resetProjectRootForTesting,
  rollback,
  setProjectRootForTesting,
  writeFile,
} from '../../../src/server/tools/filesystem.js';
import { MCPProtocolError } from '../../../src/server/types/mcp.js';

vi.mock('../../../src/server/utils/backup.js', () => ({
  createBackup: vi
    .fn()
    .mockResolvedValue('/test/backup/path/backup.txt.bak.123'),
  generateRollbackToken: vi.fn().mockReturnValue('test-rollback-token-123'),
  initializeBackup: vi.fn(),
  performRollback: vi.fn(),
  simulateFileOperation: vi.fn(
    async (
      targetPath: string,
      operation: 'write' | 'delete',
      backup: boolean = false
    ) => ({
      wouldOverwrite: false,
      backupWouldBeCreated: !!backup && operation === 'write',
      targetPath,
    })
  ),
}));

vi.mock('node:fs/promises', () => {
  const api = {
    access: vi.fn(),
    copyFile: vi.fn(),
    mkdir: vi.fn(),
    readFile: vi.fn(),
    readdir: vi.fn(),
    realpath: vi.fn(),
    rename: vi.fn(),
    stat: vi.fn(),
    unlink: vi.fn(),
    writeFile: vi.fn(),
  };
  return { ...api, default: api };
});

vi.mock('mime-types', () => ({
  default: {
    lookup: vi.fn((filePath: string) => {
      if (filePath.endsWith('.txt')) return 'text/plain';
      if (filePath.endsWith('.js')) return 'application/javascript';
      if (filePath.endsWith('.json')) return 'application/json';
      if (filePath.endsWith('.png')) return 'image/png';
      return false;
    }),
  },
}));

describe('Filesystem Tools', () => {
  const originalCwd = process.cwd();
  const testProjectRoot = '/test/project';
  let mockFs: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    const fs = await import('node:fs/promises');
    mockFs = fs;

    process.env.VITEST = 'true';
    setProjectRootForTesting(testProjectRoot);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetProjectRootForTesting();
    delete process.env.VITEST;
  });

  describe('readFile', () => {
    it('should read a valid text file successfully', async () => {
      const testContent = 'Hello, world!';
      const testUri = 'test.txt';
      const expectedPath = path.join(testProjectRoot, testUri);

      mockFs.realpath.mockResolvedValue(expectedPath);
      mockFs.stat.mockResolvedValue({
        isFile: () => true,
        size: testContent.length,
      } as any);
      mockFs.readFile.mockResolvedValue(testContent);

      const result = await readFile({ uri: testUri });

      expect(result).toEqual({
        contents: testContent,
        mimeType: 'text/plain',
      });
      expect(mockFs.readFile).toHaveBeenCalledWith(expectedPath, 'utf8');
    });

    it('should handle binary files correctly', async () => {
      const testUri = 'test.png';
      const expectedPath = path.join(testProjectRoot, testUri);
      const mockBuffer = Buffer.from('fake image data');

      mockFs.realpath.mockResolvedValue(expectedPath);
      mockFs.stat.mockResolvedValue({
        isFile: () => true,
        size: mockBuffer.length,
      } as any);
      mockFs.readFile.mockResolvedValue(mockBuffer);

      const result = await readFile({ uri: testUri });

      expect(result.mimeType).toBe('image/png');
      expect(result.contents).toContain('[Binary file');
      expect(result.contents).toContain('image/png');
    });

    it('should reject directory traversal attempts', async () => {
      const maliciousUri = '../../../etc/passwd';

      await expect(readFile({ uri: maliciousUri })).rejects.toThrow(
        MCPProtocolError
      );
      await expect(readFile({ uri: maliciousUri })).rejects.toThrow(
        /outside project directory/
      );
    });

    it('should reject absolute paths', async () => {
      const absolutePath = '/etc/passwd';

      await expect(readFile({ uri: absolutePath })).rejects.toThrow(
        MCPProtocolError
      );
      await expect(readFile({ uri: absolutePath })).rejects.toThrow(
        /Absolute paths are not allowed/
      );
    });

    it('should reject paths with null bytes', async () => {
      const maliciousUri = 'test\0.txt';

      await expect(readFile({ uri: maliciousUri })).rejects.toThrow(
        MCPProtocolError
      );
      await expect(readFile({ uri: maliciousUri })).rejects.toThrow(
        /Null byte detected/
      );
    });

    it('should handle symlinks that escape project directory', async () => {
      const testUri = 'symlink.txt';
      const expectedPath = path.join(testProjectRoot, testUri);
      const dangerousTarget = '/etc/passwd';

      mockFs.realpath.mockResolvedValue(dangerousTarget);

      await expect(readFile({ uri: testUri })).rejects.toThrow(
        MCPProtocolError
      );
      await expect(readFile({ uri: testUri })).rejects.toThrow(
        /Symlink escapes project directory/
      );
    });

    it('should enforce file size limits', async () => {
      const testUri = 'large.txt';
      const expectedPath = path.join(testProjectRoot, testUri);
      const largeSize = 500 * 1024;

      mockFs.realpath.mockResolvedValue(expectedPath);
      mockFs.stat.mockResolvedValue({
        isFile: () => true,
        size: largeSize,
      } as any);

      await expect(readFile({ uri: testUri })).rejects.toThrow(
        MCPProtocolError
      );
      await expect(readFile({ uri: testUri })).rejects.toThrow(
        /File too large/
      );
    });

    it('should handle file not found errors', async () => {
      const testUri = 'nonexistent.txt';

      mockFs.realpath.mockRejectedValue(
        new Error('ENOENT: no such file or directory')
      );
      mockFs.stat.mockRejectedValue(
        new Error('ENOENT: no such file or directory')
      );

      await expect(readFile({ uri: testUri })).rejects.toThrow(
        MCPProtocolError
      );
    });

    it('should reject directories when expecting files', async () => {
      const testUri = 'directory';
      const expectedPath = path.join(testProjectRoot, testUri);

      mockFs.realpath.mockResolvedValue(expectedPath);
      mockFs.stat.mockResolvedValue({
        isFile: () => false,
        isDirectory: () => true,
        size: 0,
      } as any);

      await expect(readFile({ uri: testUri })).rejects.toThrow(
        MCPProtocolError
      );
      await expect(readFile({ uri: testUri })).rejects.toThrow(
        /Path is not a file/
      );
    });

    it('should handle empty file URI', async () => {
      await expect(readFile({ uri: '' })).rejects.toThrow(MCPProtocolError);
    });
  });

  describe('writeFile', () => {
    it('should write a file successfully', async () => {
      const testUri = 'new-file.txt';
      const testContent = 'Hello, new world!';
      const expectedPath = path.join(testProjectRoot, testUri);
      const parentDir = path.dirname(expectedPath);

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.rename.mockResolvedValue(undefined);

      const result = await writeFile({
        uri: testUri,
        contents: testContent,
        mimeType: 'text/plain',
      });

      expect(result.success).toBe(true);
      expect(mockFs.mkdir).toHaveBeenCalledWith(parentDir, { recursive: true });

      expect(mockFs.writeFile).toHaveBeenCalledTimes(1);
      const writeFileCall = mockFs.writeFile.mock.calls[0];
      expect(writeFileCall[1]).toBe(testContent);
      expect(writeFileCall[2]).toBe('utf8');
      expect(writeFileCall[0]).toMatch(
        new RegExp(`^${expectedPath}\\.tmp\\.\\d+$`)
      );

      expect(mockFs.rename).toHaveBeenCalledTimes(1);
      const renameCall = mockFs.rename.mock.calls[0];
      expect(renameCall[0]).toBe(writeFileCall[0]);
      expect(renameCall[1]).toBe(expectedPath);
    });

    it('should reject directory traversal in write operations', async () => {
      const maliciousUri = '../../../tmp/evil.txt';
      const testContent = 'malicious content';

      await expect(
        writeFile({
          uri: maliciousUri,
          contents: testContent,
        })
      ).rejects.toThrow(MCPProtocolError);
    });

    it('should handle write permission errors', async () => {
      const testUri = 'protected.txt';
      const testContent = 'content';

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockRejectedValue(
        new Error('EACCES: permission denied')
      );

      await expect(
        writeFile({
          uri: testUri,
          contents: testContent,
        })
      ).rejects.toThrow(MCPProtocolError);
    });

    it('should perform dry run without writing files', async () => {
      const testUri = 'dry-run-test.txt';
      const testContent = 'This should not be written';
      const expectedPath = path.join(testProjectRoot, testUri);

      mockFs.access.mockRejectedValueOnce({ code: 'ENOENT' });

      const result = await writeFile({
        uri: testUri,
        contents: testContent,
        dryRun: true,
        backup: false,
      });

      expect(result.success).toBe(true);
      expect(result.dryRun).toEqual({
        wouldOverwrite: false,
        backupWouldBeCreated: false,
        targetPath: expectedPath,
      });

      expect(mockFs.writeFile).not.toHaveBeenCalled();
      expect(mockFs.rename).not.toHaveBeenCalled();
      expect(mockFs.mkdir).not.toHaveBeenCalled();
    });

    it('should create backup when backup option is enabled', async () => {
      const testUri = 'backup-file.txt';
      const testContent = 'Content requiring backup';
      const expectedPath = path.join(testProjectRoot, testUri);
      const parentDir = path.dirname(expectedPath);

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.rename.mockResolvedValue(undefined);

      const backup = await import('../../../src/server/utils/backup.js');

      const result = await writeFile({
        uri: testUri,
        contents: testContent,
        backup: true,
      });

      expect(result.success).toBe(true);
      expect((backup as any).createBackup).toHaveBeenCalledTimes(1);

      expect(mockFs.mkdir).toHaveBeenCalledWith(parentDir, { recursive: true });
      expect(mockFs.writeFile).toHaveBeenCalledTimes(1);
      expect(mockFs.rename).toHaveBeenCalledTimes(1);

      const cbCalls1 = (backup as any).createBackup.mock.calls;
      expect(cbCalls1.length).toBe(1);
      expect(cbCalls1[0][0]).toBe(expectedPath);
      if (cbCalls1[0].length >= 2) {
        const tokenArg = cbCalls1[0][1];
        expect(tokenArg === undefined || typeof tokenArg === 'string').toBe(
          true
        );
      }
    });

    it('should handle backup creation when original file does not exist', async () => {
      const testUri = 'no-original.txt';
      const testContent = 'New content';
      const expectedPath = path.join(testProjectRoot, testUri);
      const parentDir = path.dirname(expectedPath);

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.rename.mockResolvedValue(undefined);

      const backup = await import('../../../src/server/utils/backup.js');
      (backup as any).createBackup.mockResolvedValueOnce('');

      const result = await writeFile({
        uri: testUri,
        contents: testContent,
        backup: true,
      });

      expect(result.success).toBe(true);
      expect(result.backupPath).toBeUndefined();

      expect(mockFs.mkdir).toHaveBeenCalledWith(parentDir, { recursive: true });
      expect(mockFs.writeFile).toHaveBeenCalledTimes(1);
      expect(mockFs.rename).toHaveBeenCalledTimes(1);

      const cbCalls2 = (backup as any).createBackup.mock.calls;
      expect(cbCalls2.length).toBe(1);
      expect(cbCalls2[0][0]).toBe(expectedPath);
      if (cbCalls2[0].length >= 2) {
        const tokenArg = cbCalls2[0][1];
        expect(tokenArg === undefined || typeof tokenArg === 'string').toBe(
          true
        );
      }
    });
  });

  describe('listDirectory', () => {
    it('should list directory contents successfully', async () => {
      const testUri = 'src';
      const expectedPath = path.join(testProjectRoot, testUri);
      const mockEntries = ['file1.txt', 'file2.js', 'subdir'];
      const mockDate = new Date('2023-01-01T12:00:00Z');

      mockFs.stat.mockImplementation(async filePath => {
        const pathStr = filePath.toString();
        if (pathStr === expectedPath) {
          return {
            isDirectory: () => true,
            isFile: () => false,
            mtime: mockDate,
          } as any;
        }
        if (pathStr.endsWith('subdir')) {
          return {
            isDirectory: () => true,
            isFile: () => false,
            mtime: mockDate,
          } as any;
        }
        return {
          isDirectory: () => false,
          isFile: () => true,
          size: 1024,
          mtime: mockDate,
        } as any;
      });

      mockFs.readdir.mockResolvedValue(mockEntries as any);

      const result = await listDirectory({ uri: testUri });

      expect(result.entries).toHaveLength(3);
      expect(result.entries[0]).toEqual({
        uri: 'src/file1.txt',
        name: 'file1.txt',
        type: 'file',
        mimeType: 'text/plain',
        modified: mockDate.toISOString(),
      });
      expect(result.entries[2]).toEqual({
        uri: 'src/subdir',
        name: 'subdir',
        type: 'directory',
        mimeType: undefined,
        modified: mockDate.toISOString(),
      });
    });

    it('should reject directory traversal in list operations', async () => {
      const maliciousUri = '../../../';

      await expect(listDirectory({ uri: maliciousUri })).rejects.toThrow(
        MCPProtocolError
      );
    });

    it('should handle permission errors on directory listing', async () => {
      const testUri = 'protected-dir';
      const expectedPath = path.join(testProjectRoot, testUri);

      mockFs.stat.mockResolvedValue({
        isDirectory: () => true,
        isFile: () => false,
      } as any);
      mockFs.readdir.mockRejectedValue(new Error('EACCES: permission denied'));

      await expect(listDirectory({ uri: testUri })).rejects.toThrow(
        MCPProtocolError
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const testUri = 'to-delete.txt';
      const expectedPath = path.join(testProjectRoot, testUri);

      mockFs.stat.mockResolvedValue({
        isFile: () => true,
        isDirectory: () => false,
      } as any);
      mockFs.unlink.mockResolvedValue(undefined);

      const result = await deleteFile({ uri: testUri });

      expect(result.success).toBe(true);
      expect(mockFs.unlink).toHaveBeenCalledWith(expectedPath);
    });

    it('should reject deleting directories', async () => {
      const testUri = 'directory';
      const expectedPath = path.join(testProjectRoot, testUri);

      mockFs.stat.mockResolvedValue({
        isFile: () => false,
        isDirectory: () => true,
      } as any);

      await expect(deleteFile({ uri: testUri })).rejects.toThrow(
        MCPProtocolError
      );
      await expect(deleteFile({ uri: testUri })).rejects.toThrow(
        /Path is not a file/
      );
    });

    it('should handle file not found during deletion', async () => {
      const testUri = 'nonexistent.txt';

      mockFs.stat.mockRejectedValue(
        new Error('ENOENT: no such file or directory')
      );

      await expect(deleteFile({ uri: testUri })).rejects.toThrow(
        MCPProtocolError
      );
    });
  });

  describe('rollback', () => {
    it('should handle invalid rollback token', async () => {
      const invalidToken = 'invalid-token';

      await expect(rollback({ rollbackToken: invalidToken })).rejects.toThrow(
        MCPProtocolError
      );
      await expect(rollback({ rollbackToken: invalidToken })).rejects.toThrow(
        /Failed to perform rollback/
      );
    });

    it('should handle missing parameters', async () => {
      await expect(rollback({} as any)).rejects.toThrow(MCPProtocolError);
      await expect(rollback({ rollbackToken: '' })).rejects.toThrow(
        MCPProtocolError
      );
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle various path normalization cases', async () => {
      const testCases = [
        'file.txt',
        './file.txt',
        'dir/../file.txt',
        'dir/./file.txt',
        'dir//file.txt',
      ];

      for (const testUri of testCases) {
        mockFs.realpath.mockResolvedValue(
          path.join(testProjectRoot, 'file.txt')
        );
        mockFs.stat.mockResolvedValue({
          isFile: () => true,
          size: 100,
        } as any);
        mockFs.readFile.mockResolvedValue('content');

        await expect(readFile({ uri: testUri })).resolves.toBeDefined();
      }
    });

    it('should handle Windows-style path separators', async () => {
      const testUri = 'dir\\file.txt';

      mockFs.realpath.mockResolvedValue(
        path.join(testProjectRoot, 'dir', 'file.txt')
      );
      mockFs.stat.mockResolvedValue({
        isFile: () => true,
        size: 100,
      } as any);
      mockFs.readFile.mockResolvedValue('content');

      await expect(readFile({ uri: testUri })).resolves.toBeDefined();
    });

    it('should handle complex directory traversal attempts', async () => {
      const maliciousCases = [
        '..\\..\\..\\windows\\system32\\config\\sam',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '....//....//....//etc/passwd',
        '\\\\..\\\\..\\\\..\\\\etc\\\\passwd',
      ];

      for (const maliciousUri of maliciousCases) {
        await expect(readFile({ uri: maliciousUri })).rejects.toThrow(
          MCPProtocolError
        );
      }
    });
  });
});
