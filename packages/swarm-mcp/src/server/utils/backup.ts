import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { logger } from './logger.js';
import { createFileOperationError } from './validation.js';

interface RollbackOperation {
  originalPath: string;
  backupPath: string;
  operation: 'write' | 'delete';
  timestamp: Date;
}

const rollbackRegistry = new Map<string, RollbackOperation>();
interface BackupConfig {
  backupDir: string;
  maxBackupAge: number;
  maxBackups: number;
}

let backupConfig: BackupConfig;

export function initializeBackup(projectRoot: string): void {
  backupConfig = {
    backupDir: path.join(projectRoot, '.mcp_backups'),
    maxBackupAge: 7 * 24 * 60 * 60 * 1000,
    maxBackups: 100,
  };
}

async function getBackupDir(): Promise<string> {
  if (!backupConfig) {
    throw new Error(
      'Backup utilities not initialized. Call initializeBackup() first.'
    );
  }

  try {
    await fs.mkdir(backupConfig.backupDir, { recursive: true });
  } catch (error) {
    throw createFileOperationError(
      'create backup directory',
      backupConfig.backupDir,
      error
    );
  }

  return backupConfig.backupDir;
}

export function generateRollbackToken(): string {
  return randomUUID();
}

export async function createBackup(
  originalPath: string,
  rollbackToken?: string
): Promise<string> {
  const backupDir = await getBackupDir();
  const fileName = path.basename(originalPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const backupFileName = rollbackToken
    ? `${fileName}.bak.${rollbackToken}`
    : `${fileName}.bak.${timestamp}`;

  const backupPath = path.join(backupDir, backupFileName);

  try {
    await fs.access(originalPath);
    await fs.copyFile(originalPath, backupPath);

    logger.debug('Backup created', { originalPath, backupPath, rollbackToken });

    if (rollbackToken) {
      rollbackRegistry.set(rollbackToken, {
        originalPath,
        backupPath,
        operation: 'write',
        timestamp: new Date(),
      });
    }

    return backupPath;
  } catch (error) {
    if ((error as { code?: string }).code === 'ENOENT') {
      logger.debug('No backup needed - file does not exist', { originalPath });
      return '';
    }

    throw createFileOperationError('create backup for', originalPath, error);
  }
}

export async function simulateFileOperation(
  targetPath: string,
  operation: 'write' | 'delete',
  backup: boolean = false
): Promise<{
  wouldOverwrite: boolean;
  backupWouldBeCreated: boolean;
  targetPath: string;
}> {
  let wouldOverwrite = false;
  let backupWouldBeCreated = false;

  try {
    await fs.access(targetPath);
    wouldOverwrite = true;

    if (backup && operation === 'write') {
      backupWouldBeCreated = true;
    }
  } catch (error) {
    if ((error as { code?: string }).code !== 'ENOENT') {
      throw error;
    }
  }

  return {
    wouldOverwrite,
    backupWouldBeCreated,
    targetPath,
  };
}

export async function performRollback(
  rollbackToken: string
): Promise<string[]> {
  const operation = rollbackRegistry.get(rollbackToken);

  if (!operation) {
    throw new Error(`Rollback token not found: ${rollbackToken}`);
  }

  const restoredFiles: string[] = [];

  try {
    await fs.access(operation.backupPath);
    await fs.copyFile(operation.backupPath, operation.originalPath);

    logger.info('File restored from backup', {
      originalPath: operation.originalPath,
      backupPath: operation.backupPath,
      rollbackToken,
    });

    restoredFiles.push(operation.originalPath);
    await fs.unlink(operation.backupPath);
    rollbackRegistry.delete(rollbackToken);
  } catch (error) {
    throw createFileOperationError('rollback', operation.originalPath, error);
  }

  return restoredFiles;
}

export async function cleanupOldBackups(): Promise<void> {
  if (!backupConfig) {
    return;
  }

  try {
    const backupDir = backupConfig.backupDir;
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(file => file.includes('.bak.'));

    const fileStats = await Promise.all(
      backupFiles.map(async file => {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);
        return { file, path: filePath, mtime: stats.mtime };
      })
    );

    fileStats.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());

    const now = Date.now();
    let deletedCount = 0;

    for (const { path: filePath, mtime } of fileStats) {
      const age = now - mtime.getTime();
      const shouldDelete =
        age > backupConfig.maxBackupAge ||
        deletedCount < fileStats.length - backupConfig.maxBackups;

      if (shouldDelete) {
        try {
          await fs.unlink(filePath);
          deletedCount++;
          logger.debug('Deleted old backup', { path: filePath, age });
        } catch (error) {
          logger.warn('Failed to delete old backup', { path: filePath, error });
        }
      }
    }

    if (deletedCount > 0) {
      logger.info('Cleaned up old backups', { deletedCount });
    }
  } catch (error) {
    logger.warn('Failed to cleanup old backups', { error });
  }
}

export function getRollbackInfo(
  rollbackToken: string
): RollbackOperation | undefined {
  return rollbackRegistry.get(rollbackToken);
}

export function listRollbackTokens(): string[] {
  return Array.from(rollbackRegistry.keys());
}

export function clearRollbackRegistry(): void {
  rollbackRegistry.clear();
}
