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
  maxBackupAge: number; // in milliseconds
  maxBackups: number;
}

let backupConfig: BackupConfig;

/**
 * Initialize backup utilities with configuration
 */
export function initializeBackup(projectRoot: string): void {
  backupConfig = {
    backupDir: path.join(projectRoot, '.mcp_backups'),
    maxBackupAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxBackups: 100,
  };
}

/**
 * Get backup directory, creating it if it doesn't exist
 */
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

/**
 * Generate a rollback token
 */
export function generateRollbackToken(): string {
  return randomUUID();
}

/**
 * Create a backup file with optional rollback token
 */
export async function createBackup(
  originalPath: string,
  rollbackToken?: string
): Promise<string> {
  const backupDir = await getBackupDir();
  const fileName = path.basename(originalPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Generate backup filename
  const backupFileName = rollbackToken
    ? `${fileName}.bak.${rollbackToken}`
    : `${fileName}.bak.${timestamp}`;

  const backupPath = path.join(backupDir, backupFileName);

  try {
    // Check if original file exists
    await fs.access(originalPath);

    // Create backup
    await fs.copyFile(originalPath, backupPath);

    logger.debug('Backup created', { originalPath, backupPath, rollbackToken });

    // Register for rollback if token provided
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
    // If original file doesn't exist, no backup needed
    if ((error as { code?: string }).code === 'ENOENT') {
      logger.debug('No backup needed - file does not exist', { originalPath });
      return '';
    }

    throw createFileOperationError('create backup for', originalPath, error);
  }
}

/**
 * Simulate dry run for file operations
 */
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
    // Check if target file exists
    await fs.access(targetPath);
    wouldOverwrite = true;

    // Would create backup if requested and file exists
    if (backup && operation === 'write') {
      backupWouldBeCreated = true;
    }
  } catch (error) {
    // File doesn't exist, so no overwrite
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

/**
 * Perform rollback operation
 */
export async function performRollback(
  rollbackToken: string
): Promise<string[]> {
  const operation = rollbackRegistry.get(rollbackToken);

  if (!operation) {
    throw new Error(`Rollback token not found: ${rollbackToken}`);
  }

  const restoredFiles: string[] = [];

  try {
    // Check if backup file exists
    await fs.access(operation.backupPath);

    // Restore the backup
    await fs.copyFile(operation.backupPath, operation.originalPath);

    logger.info('File restored from backup', {
      originalPath: operation.originalPath,
      backupPath: operation.backupPath,
      rollbackToken,
    });

    restoredFiles.push(operation.originalPath);

    // Clean up backup file
    await fs.unlink(operation.backupPath);

    // Remove from registry
    rollbackRegistry.delete(rollbackToken);
  } catch (error) {
    throw createFileOperationError('rollback', operation.originalPath, error);
  }

  return restoredFiles;
}

/**
 * Clean up old backups based on age and count
 */
export async function cleanupOldBackups(): Promise<void> {
  if (!backupConfig) {
    return;
  }

  try {
    const backupDir = backupConfig.backupDir;
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(file => file.includes('.bak.'));

    // Get file stats and sort by modification time
    const fileStats = await Promise.all(
      backupFiles.map(async file => {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);
        return { file, path: filePath, mtime: stats.mtime };
      })
    );

    // Sort by modification time (oldest first)
    fileStats.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());

    const now = Date.now();
    let deletedCount = 0;

    // Delete files based on age and count
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

/**
 * Get rollback operation info
 */
export function getRollbackInfo(
  rollbackToken: string
): RollbackOperation | undefined {
  return rollbackRegistry.get(rollbackToken);
}

/**
 * List all active rollback tokens
 */
export function listRollbackTokens(): string[] {
  return Array.from(rollbackRegistry.keys());
}
