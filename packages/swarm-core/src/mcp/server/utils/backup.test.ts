import { promises as fs } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanupOldBackups,
  clearRollbackRegistry,
  createBackup,
  generateRollbackToken,
  getRollbackInfo,
  initializeBackup,
  listRollbackTokens,
  performRollback,
  simulateFileOperation,
} from './backup.js';

vi.mock('node:fs', () => ({
  promises: {
    mkdir: vi.fn(),
    access: vi.fn(),
    copyFile: vi.fn(),
    unlink: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
  },
}));

vi.mock('./logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('./validation.js', () => ({
  createFileOperationError: vi.fn((operation, path) => {
    const mcpError = new Error(`File operation failed: ${operation} ${path}`);
    (mcpError as any).code = -32603;
    return mcpError;
  }),
}));

const mockFs = vi.mocked(fs);

describe('Backup Utilities', () => {
  const testProjectRoot = '/tests/project';
  const testFilePath = path.join(testProjectRoot, 'test.txt');
  const expectedBackupDir = path.join(testProjectRoot, '.mcp_backups');

  beforeEach(() => {
    vi.clearAllMocks();
    clearRollbackRegistry();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initializeBackup', () => {
    it('should set backup configuration', () => {
      initializeBackup(testProjectRoot);

      expect(() => generateRollbackToken()).not.toThrow();
    });

    it('should set default backup configuration values', () => {
      initializeBackup(testProjectRoot);

      const token1 = generateRollbackToken();
      const token2 = generateRollbackToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRollbackToken', () => {
    it('should generate unique UUID tokens', () => {
      initializeBackup(testProjectRoot);

      const token1 = generateRollbackToken();
      const token2 = generateRollbackToken();

      expect(token1).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
      expect(token2).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
      expect(token1).not.toBe(token2);
    });
  });

  describe('createBackup', () => {
    beforeEach(() => {
      initializeBackup(testProjectRoot);
    });

    it('should create backup directory if it does not exist', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);

      await createBackup(testFilePath);

      expect(mockFs.mkdir).toHaveBeenCalledWith(expectedBackupDir, {
        recursive: true,
      });
    });

    it('should create backup with timestamp when no rollback token provided', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);

      const result = await createBackup(testFilePath);

      expect(result).toMatch(
        /\.bak\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/
      );
      expect(mockFs.copyFile).toHaveBeenCalledWith(
        testFilePath,
        expect.stringContaining('.bak.')
      );
    });

    it('should create backup with rollback token when provided', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);

      const rollbackToken = 'test-token-123';
      const result = await createBackup(testFilePath, rollbackToken);

      expect(result).toContain(rollbackToken);
      expect(result).toMatch(/\.bak\.test-token-123$/);
    });

    it('should register rollback operation when token provided', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);

      const rollbackToken = 'test-token-456';
      await createBackup(testFilePath, rollbackToken);

      const rollbackInfo = getRollbackInfo(rollbackToken);
      expect(rollbackInfo).toBeDefined();
      expect(rollbackInfo?.originalPath).toBe(testFilePath);
      expect(rollbackInfo?.operation).toBe('write');
    });

    it('should return empty string when original file does not exist', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockRejectedValue({ code: 'ENOENT' });

      const result = await createBackup(testFilePath);

      expect(result).toBe('');
      expect(mockFs.copyFile).not.toHaveBeenCalled();
    });

    it('should throw error when backup directory creation fails', async () => {
      const mkdirError = new Error('Permission denied');
      mockFs.mkdir.mockRejectedValue(mkdirError);

      await expect(createBackup(testFilePath)).rejects.toThrow(
        'File operation failed: create backup directory'
      );
    });

    it('should throw error when file copy fails', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.copyFile.mockRejectedValue(new Error('Copy failed'));

      await expect(createBackup(testFilePath)).rejects.toThrow(
        'File operation failed: create backup for'
      );
    });
  });

  describe('simulateFileOperation', () => {
    beforeEach(() => {
      initializeBackup(testProjectRoot);
    });

    it('should detect existing file for write operation', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const result = await simulateFileOperation(testFilePath, 'write');

      expect(result.wouldOverwrite).toBe(true);
      expect(result.backupWouldBeCreated).toBe(false);
      expect(result.targetPath).toBe(testFilePath);
    });

    it('should detect existing file for delete operation', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const result = await simulateFileOperation(testFilePath, 'delete');

      expect(result.wouldOverwrite).toBe(true);
      expect(result.backupWouldBeCreated).toBe(false);
      expect(result.targetPath).toBe(testFilePath);
    });

    it('should indicate backup would be created for write operation with backup enabled', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const result = await simulateFileOperation(testFilePath, 'write', true);

      expect(result.wouldOverwrite).toBe(true);
      expect(result.backupWouldBeCreated).toBe(true);
      expect(result.targetPath).toBe(testFilePath);
    });

    it('should not indicate backup for delete operation with backup enabled', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const result = await simulateFileOperation(testFilePath, 'delete', true);

      expect(result.wouldOverwrite).toBe(true);
      expect(result.backupWouldBeCreated).toBe(false);
      expect(result.targetPath).toBe(testFilePath);
    });

    it('should detect non-existent file', async () => {
      mockFs.access.mockRejectedValue({ code: 'ENOENT' });

      const result = await simulateFileOperation(testFilePath, 'write');

      expect(result.wouldOverwrite).toBe(false);
      expect(result.backupWouldBeCreated).toBe(false);
      expect(result.targetPath).toBe(testFilePath);
    });

    it('should re-throw non-ENOENT errors', async () => {
      const accessError = new Error('Permission denied');
      mockFs.access.mockRejectedValue(accessError);

      await expect(
        simulateFileOperation(testFilePath, 'write')
      ).rejects.toThrow('Permission denied');
    });
  });

  describe('performRollback', () => {
    beforeEach(() => {
      initializeBackup(testProjectRoot);
    });

    it('should restore file from backup and clean up', async () => {
      const rollbackToken = 'rollback-token-123';

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);
      await createBackup(testFilePath, rollbackToken);

      vi.clearAllMocks();
      mockFs.access.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);
      mockFs.unlink.mockResolvedValue(undefined);

      const result = await performRollback(rollbackToken);

      expect(result).toEqual([testFilePath]);
      expect(mockFs.copyFile).toHaveBeenCalledWith(
        expect.stringContaining(rollbackToken),
        testFilePath
      );
      expect(mockFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining(rollbackToken)
      );
    });

    it('should throw error for unknown rollback token', async () => {
      await expect(performRollback('unknown-token')).rejects.toThrow(
        'Rollback token not found: unknown-token'
      );
    });

    it('should throw error when backup file does not exist', async () => {
      const rollbackToken = 'rollback-token-456';

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);
      await createBackup(testFilePath, rollbackToken);

      vi.clearAllMocks();
      mockFs.access.mockRejectedValue({ code: 'ENOENT' });

      await expect(performRollback(rollbackToken)).rejects.toThrow(
        'File operation failed: rollback'
      );
    });

    it('should throw error when file copy fails during rollback', async () => {
      const rollbackToken = 'rollback-token-789';

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);
      await createBackup(testFilePath, rollbackToken);

      vi.clearAllMocks();
      mockFs.access.mockResolvedValue(undefined);
      mockFs.copyFile.mockRejectedValue(new Error('Copy failed'));

      await expect(performRollback(rollbackToken)).rejects.toThrow(
        'File operation failed: rollback'
      );
    });
  });

  describe('cleanupOldBackups', () => {
    beforeEach(() => {
      initializeBackup(testProjectRoot);
    });

    it('should do nothing when backup config is not initialized', async () => {
      vi.resetModules();

      await expect(cleanupOldBackups()).resolves.toBeUndefined();
    });

    it('should cleanup old backups based on age and count', async () => {
      const mockFiles = ['file1.bak.old', 'file2.bak.new', 'file3.bak.older'];
      const mockStats = [
        { mtime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { mtime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { mtime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      ];

      mockFs.readdir.mockResolvedValue(mockFiles as any);
      mockFs.stat.mockImplementation((filePath) => {
        const index = mockFiles.findIndex((f) => String(filePath).includes(f));
        return Promise.resolve(mockStats[index] as any);
      });
      mockFs.unlink.mockResolvedValue(undefined);

      await cleanupOldBackups();

      expect(mockFs.unlink).toHaveBeenCalledTimes(2);
    });

    it('should handle errors during cleanup gracefully', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Read failed'));

      await expect(cleanupOldBackups()).resolves.toBeUndefined();
    });

    it('should handle individual file deletion failures gracefully', async () => {
      const mockFiles = ['file1.bak.old'];
      mockFs.readdir.mockResolvedValue(mockFiles as any);
      mockFs.stat.mockResolvedValue({ mtime: new Date(0) } as any);
      mockFs.unlink.mockRejectedValue(new Error('Delete failed'));

      await expect(cleanupOldBackups()).resolves.toBeUndefined();
    });
  });

  describe('getRollbackInfo', () => {
    beforeEach(() => {
      initializeBackup(testProjectRoot);
    });

    it('should return rollback operation info for valid token', async () => {
      const rollbackToken = 'info-token-123';

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);
      await createBackup(testFilePath, rollbackToken);

      const info = getRollbackInfo(rollbackToken);

      expect(info).toBeDefined();
      expect(info?.originalPath).toBe(testFilePath);
      expect(info?.operation).toBe('write');
      expect(info?.timestamp).toBeInstanceOf(Date);
    });

    it('should return undefined for unknown token', () => {
      const info = getRollbackInfo('unknown-token');
      expect(info).toBeUndefined();
    });
  });

  describe('listRollbackTokens', () => {
    beforeEach(() => {
      initializeBackup(testProjectRoot);
    });

    it('should return empty array when no rollback operations registered', () => {
      const tokens = listRollbackTokens();
      expect(tokens).toEqual([]);
    });

    it('should return all registered rollback tokens', async () => {
      const token1 = 'token-1';
      const token2 = 'token-2';

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);

      await createBackup(testFilePath, token1);
      await createBackup(path.join(testProjectRoot, 'other.txt'), token2);

      const tokens = listRollbackTokens();

      expect(tokens).toHaveLength(2);
      expect(tokens).toContain(token1);
      expect(tokens).toContain(token2);
    });

    it('should not return tokens after rollback operations', async () => {
      const rollbackToken = 'cleanup-token';

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);
      await createBackup(testFilePath, rollbackToken);

      expect(listRollbackTokens()).toContain(rollbackToken);

      mockFs.access.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);
      mockFs.unlink.mockResolvedValue(undefined);
      await performRollback(rollbackToken);

      expect(listRollbackTokens()).not.toContain(rollbackToken);
    });
  });
});
