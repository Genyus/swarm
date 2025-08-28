import mime from 'mime-types';
import { Stats } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  DeleteFileParams,
  DeleteFileResult,
  DirectoryEntry,
  ListDirectoryParams,
  ListDirectoryResult,
  MCPErrorCode,
  MCPProtocolError,
  ReadFileParams,
  ReadFileResult,
  RollbackParams,
  RollbackResult,
  WriteFileParams,
  WriteFileResult,
} from '../types/mcp.js';
import {
  createBackup,
  generateRollbackToken,
  initializeBackup,
  performRollback,
  simulateFileOperation,
} from '../utils/backup.js';
import { logger } from '../utils/logger.js';
import {
  createFileOperationError,
  DeleteFileSchema,
  FileUriSchema,
  ListDirectorySchema,
  sanitizeFileContents,
  shouldReadAsText,
  validateFileSize,
  validateProjectFilePath,
  WriteFileSchema,
} from '../utils/validation.js';

let PROJECT_ROOT = process.env['SWARM_MCP_PROJECT_ROOT'] || process.cwd();

initializeBackup(PROJECT_ROOT);

/**
 * Reads a file from the project directory with comprehensive security checks
 *
 * @param params - File reading parameters containing the URI
 * @returns Promise resolving to file contents and MIME type
 * @throws {MCPProtocolError} For various error conditions
 */
export async function readFile(
  params: ReadFileParams
): Promise<ReadFileResult> {
  try {
    if (!params || typeof params.uri !== 'string') {
      throw new MCPProtocolError(
        MCPErrorCode.InvalidParams,
        'Invalid parameters: uri is required'
      );
    }

    const { uri } = params;

    logger.debug('Reading file', { uri, projectRoot: PROJECT_ROOT });

    const absolutePath = validateProjectFilePath(uri, PROJECT_ROOT);
    FileUriSchema.parse(params);

    let realPath: string;
    try {
      realPath = await fs.realpath(absolutePath);
    } catch {
      realPath = absolutePath;
    }

    const projectRootWithSep = PROJECT_ROOT + path.sep;
    if (!realPath.startsWith(projectRootWithSep) && realPath !== PROJECT_ROOT) {
      throw new MCPProtocolError(
        MCPErrorCode.PermissionDenied,
        'Symlink escapes project directory'
      );
    }

    let stats: Stats;
    try {
      stats = await fs.stat(realPath);
    } catch (error) {
      throw createFileOperationError('read', uri, error);
    }

    if (!stats.isFile()) {
      throw new MCPProtocolError(
        MCPErrorCode.InvalidParams,
        `Path is not a file: ${uri}`
      );
    }

    validateFileSize(stats.size);
    const mimeType = mime.lookup(realPath) || 'application/octet-stream';

    // Read file contents
    let contents: string;
    try {
      if (shouldReadAsText(mimeType)) {
        contents = await fs.readFile(realPath, 'utf8');
      } else {
        // For binary files, read as buffer and convert to base64
        const buffer = await fs.readFile(realPath);
        contents = `[Binary file: ${buffer.length} bytes, MIME type: ${mimeType}]`;
      }
    } catch (error) {
      throw createFileOperationError('read', uri, error);
    }

    // Sanitize contents for safe transmission
    const sanitizedContents = sanitizeFileContents(contents, mimeType);

    logger.debug('File read successfully', {
      uri,
      size: stats.size,
      mimeType,
      contentLength: sanitizedContents.length,
    });

    return {
      contents: sanitizedContents,
      mimeType,
    };
  } catch (error) {
    logger.error('Error reading file', {
      uri: params.uri,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof MCPProtocolError) {
      throw error;
    }

    throw createFileOperationError('read', params.uri, error);
  }
}

/**
 * Writes content to a file in the project directory with security checks,
 * backup creation, dry run simulation, and rollback support
 *
 * @param params - File writing parameters including optional backup, dryRun, and rollbackToken
 * @returns Promise resolving to write result with backup info and rollback token
 * @throws {MCPProtocolError} For various error conditions
 */
export async function writeFile(
  params: WriteFileParams
): Promise<WriteFileResult> {
  try {
    // Basic parameter check
    if (
      !params ||
      typeof params.uri !== 'string' ||
      typeof params.contents !== 'string'
    ) {
      throw new MCPProtocolError(
        MCPErrorCode.InvalidParams,
        'Invalid parameters: uri and contents are required'
      );
    }

    const {
      uri,
      contents,
      mimeType,
      backup = false,
      dryRun = false,
      rollbackToken,
    } = params;

    logger.debug('Writing file', {
      uri,
      contentLength: contents.length,
      mimeType,
      backup,
      dryRun,
      rollbackToken,
    });

    if (rollbackToken && !dryRun && !backup) {
      await performRollback(rollbackToken);
      return {
        success: true,
        rollbackToken,
        dryRun: undefined,
        backupPath: undefined,
      };
    }

    const absolutePath = validateProjectFilePath(uri, PROJECT_ROOT);
    WriteFileSchema.parse(params);

    // Handle dry run simulation
    if (dryRun) {
      const simulation = await simulateFileOperation(
        absolutePath,
        'write',
        backup
      );
      logger.debug('Dry run simulation', { uri, simulation });

      return {
        success: true,
        dryRun: simulation,
        backupPath: undefined,
        rollbackToken: undefined,
      };
    }

    // Ensure parent directory exists
    const parentDir = path.dirname(absolutePath);
    try {
      await fs.mkdir(parentDir, { recursive: true });
    } catch (error) {
      throw createFileOperationError('create directory for', uri, error);
    }

    // Create backup if requested or if rollback token provided
    let backupPath: string | undefined;
    let generatedRollbackToken: string | undefined;

    if (backup || rollbackToken) {
      generatedRollbackToken = rollbackToken || generateRollbackToken();
      backupPath = await createBackup(absolutePath, generatedRollbackToken);

      if (backupPath) {
        logger.debug('Backup created', {
          originalPath: absolutePath,
          backupPath,
          rollbackToken: generatedRollbackToken,
        });
      }
    }

    // Write the file atomically using temp file
    const tempPath = `${absolutePath}.tmp.${Date.now()}`;

    try {
      // Write to temporary file first
      await fs.writeFile(tempPath, contents, 'utf8');

      // Atomically move temp file to target location
      await fs.rename(tempPath, absolutePath);
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
      throw createFileOperationError('write', uri, error);
    }

    logger.info('File written successfully', {
      uri,
      size: contents.length,
      backup: !!backupPath,
      rollbackToken: generatedRollbackToken,
    });

    return {
      success: true,
      backupPath: backupPath || undefined,
      rollbackToken: generatedRollbackToken,
      dryRun: undefined,
    };
  } catch (error) {
    logger.error('Error writing file', {
      uri: params.uri,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof MCPProtocolError) {
      throw error;
    }

    throw createFileOperationError('write', params.uri, error);
  }
}

/**
 * Lists contents of a directory with enhanced features including filtering,
 * sorting, recursive listing, file metadata, and pagination
 *
 * @param params - Enhanced directory listing parameters
 * @returns Promise resolving to directory entries with metadata
 * @throws {MCPProtocolError} For various error conditions
 */
export async function listDirectory(
  params: ListDirectoryParams
): Promise<ListDirectoryResult> {
  try {
    // Basic parameter check
    if (!params || typeof params.uri !== 'string') {
      throw new MCPProtocolError(
        MCPErrorCode.InvalidParams,
        'Invalid parameters: uri is required'
      );
    }

    const {
      uri,
      recursive = false,
      maxDepth = 3,
      includeSize = false,
      includePermissions = false,
      sortBy = 'name',
      sortOrder = 'asc',
      filter,
      pagination,
    } = params;

    logger.debug('Listing directory with enhanced features', {
      uri,
      recursive,
      maxDepth,
      includeSize,
      includePermissions,
      sortBy,
      sortOrder,
      filter,
      pagination,
    });

    // Validate with Zod schema
    ListDirectorySchema.parse(params);

    // Validate and resolve the directory path (this includes comprehensive security checks)
    const absolutePath = validateProjectFilePath(uri, PROJECT_ROOT);

    // Get directory entries
    const allEntries = await listDirectoryRecursive(
      absolutePath,
      uri,
      recursive,
      maxDepth,
      0,
      includeSize,
      includePermissions
    );

    // Apply filtering
    let filteredEntries = allEntries;
    if (filter) {
      filteredEntries = applyFilters(allEntries, filter);
    }

    // Apply sorting
    const sortedEntries = applySorting(filteredEntries, sortBy, sortOrder);

    // Apply pagination
    const totalCount = sortedEntries.length;
    let finalEntries = sortedEntries;
    let paginationInfo;

    if (pagination) {
      const offset = pagination.offset || 0;
      const limit = pagination.limit || 100;
      finalEntries = sortedEntries.slice(offset, offset + limit);

      paginationInfo = {
        offset,
        limit,
        total: totalCount,
      };
    }

    logger.debug('Directory listed successfully', {
      uri,
      totalCount,
      filteredCount: filteredEntries.length,
      returnedCount: finalEntries.length,
      recursive,
      hasMore: pagination
        ? (pagination.offset || 0) + finalEntries.length < totalCount
        : false,
    });

    const result: ListDirectoryResult = {
      entries: finalEntries,
      totalCount,
      pagination: paginationInfo,
    };

    if (pagination) {
      result.hasMore =
        (pagination.offset || 0) + finalEntries.length < totalCount;
    }

    return result;
  } catch (error) {
    logger.error('Error listing directory', {
      uri: params.uri,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof MCPProtocolError) {
      throw error;
    }

    throw createFileOperationError('list', params.uri, error);
  }
}

/**
 * Recursively lists directory contents with metadata
 */
async function listDirectoryRecursive(
  absolutePath: string,
  baseUri: string,
  recursive: boolean,
  maxDepth: number,
  currentDepth: number,
  includeSize: boolean,
  includePermissions: boolean
): Promise<DirectoryEntry[]> {
  // Check if directory exists and get stats
  let stats: Stats;
  try {
    stats = await fs.stat(absolutePath);
  } catch (error) {
    throw createFileOperationError('list', baseUri, error);
  }

  // Ensure it's actually a directory
  if (!stats.isDirectory()) {
    throw new MCPProtocolError(
      MCPErrorCode.InvalidParams,
      `Path is not a directory: ${baseUri}`
    );
  }

  // Read directory contents
  let entries: string[];
  try {
    entries = await fs.readdir(absolutePath);
  } catch (error) {
    throw createFileOperationError('list', baseUri, error);
  }

  // Build entry list with metadata
  const directoryEntries: DirectoryEntry[] = [];

  for (const entryName of entries) {
    const entryPath = path.join(absolutePath, entryName);
    const entryUri = baseUri === '' ? entryName : path.join(baseUri, entryName);

    try {
      const entryStats = await fs.stat(entryPath);
      const isDirectory = entryStats.isDirectory();
      const isFile = entryStats.isFile();

      const entry: DirectoryEntry = {
        uri: entryUri,
        name: entryName,
        type: isDirectory ? 'directory' : 'file',
        mimeType: isFile
          ? mime.lookup(entryPath) || 'application/octet-stream'
          : undefined,
      };

      // Add size information if requested
      if (includeSize) {
        entry.size = isFile ? entryStats.size : undefined;
      }

      // Add permission information if requested
      if (includePermissions) {
        entry.permissions = formatPermissions(entryStats.mode);
      }

      // Add modification time
      entry.modified = entryStats.mtime.toISOString();

      // Handle recursive listing for directories
      if (recursive && isDirectory && currentDepth < maxDepth) {
        try {
          const children = await listDirectoryRecursive(
            entryPath,
            entryUri,
            recursive,
            maxDepth,
            currentDepth + 1,
            includeSize,
            includePermissions
          );
          entry.children = children;
        } catch (error) {
          // Log warning but don't fail the whole operation
          logger.warn('Could not list subdirectory', {
            path: entryUri,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      directoryEntries.push(entry);
    } catch (error) {
      // Skip entries that can't be stat'd (broken symlinks, permission issues)
      logger.warn('Could not stat directory entry', {
        entry: entryUri,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return directoryEntries;
}

/**
 * Applies filtering to directory entries
 */
function applyFilters(
  entries: DirectoryEntry[],
  filter: NonNullable<ListDirectoryParams['filter']>
): DirectoryEntry[] {
  return entries.filter(entry => {
    // Filter by type
    if (filter.type && entry.type !== filter.type) {
      return false;
    }

    // Filter by name pattern
    if (filter.namePattern) {
      try {
        const regex = new RegExp(filter.namePattern, 'i');
        if (!regex.test(entry.name)) {
          return false;
        }
      } catch (error) {
        // Invalid regex pattern, skip this filter
        logger.warn('Invalid name pattern regex', {
          pattern: filter.namePattern,
          error,
        });
      }
    }

    // Filter by extensions
    if (
      filter.extensions &&
      filter.extensions.length > 0 &&
      entry.type === 'file'
    ) {
      const fileExt = path.extname(entry.name).toLowerCase();
      const hasMatchingExt = filter.extensions.some(
        ext =>
          fileExt ===
          (ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`)
      );
      if (!hasMatchingExt) {
        return false;
      }
    }

    // Filter by file size
    if (entry.size !== undefined) {
      if (filter.minSize !== undefined && entry.size < filter.minSize) {
        return false;
      }
      if (filter.maxSize !== undefined && entry.size > filter.maxSize) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Applies sorting to directory entries
 */
function applySorting(
  entries: DirectoryEntry[],
  sortBy: NonNullable<ListDirectoryParams['sortBy']>,
  sortOrder: NonNullable<ListDirectoryParams['sortOrder']>
): DirectoryEntry[] {
  const sorted = [...entries].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size': {
        const aSize = a.size || 0;
        const bSize = b.size || 0;
        comparison = aSize - bSize;
        break;
      }
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'modified': {
        const aModified = new Date(a.modified || 0).getTime();
        const bModified = new Date(b.modified || 0).getTime();
        comparison = aModified - bModified;
        break;
      }
      default:
        comparison = a.name.localeCompare(b.name);
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

/**
 * Formats Unix file permissions as a human-readable string
 */
function formatPermissions(mode: number): string {
  const permissions = (mode & 0o777).toString(8).padStart(3, '0');
  const chars = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];

  const owner = chars[parseInt(permissions[0] || '0', 10)] || '---';
  const group = chars[parseInt(permissions[1] || '0', 10)] || '---';
  const other = chars[parseInt(permissions[2] || '0', 10)] || '---';

  return `${owner}${group}${other}`;
}

/**
 * Deletes a file from the project directory with security checks,
 * backup creation, dry run simulation, and rollback support
 *
 * @param params - Enhanced file deletion parameters including optional backup, dryRun, and rollbackToken
 * @returns Promise resolving to deletion result with backup info and rollback token
 * @throws {MCPProtocolError} For various error conditions
 */
export async function deleteFile(
  params: DeleteFileParams
): Promise<DeleteFileResult> {
  try {
    // Basic parameter check
    if (!params || typeof params.uri !== 'string') {
      throw new MCPProtocolError(
        MCPErrorCode.InvalidParams,
        'Invalid parameters: uri is required'
      );
    }

    const { uri, backup = false, dryRun = false, rollbackToken } = params;

    logger.debug('Deleting file with enhanced features', {
      uri,
      backup,
      dryRun,
      rollbackToken,
    });

    // Handle rollback operation
    if (rollbackToken && !dryRun && !backup) {
      await performRollback(rollbackToken);
      return {
        success: true,
        rollbackToken,
        dryRun: undefined,
        backupPath: undefined,
      };
    }

    // Validate and resolve the file path (this includes comprehensive security checks)
    const absolutePath = validateProjectFilePath(uri, PROJECT_ROOT);

    // Now validate with Zod for additional checks
    DeleteFileSchema.parse(params);

    // Check if file exists and get stats
    let stats: Stats;
    try {
      stats = await fs.stat(absolutePath);
    } catch (error) {
      throw createFileOperationError('delete', uri, error);
    }

    // Ensure it's actually a file, not a directory
    if (!stats.isFile()) {
      throw new MCPProtocolError(
        MCPErrorCode.InvalidParams,
        `Path is not a file: ${uri}. Use directory deletion tools for directories.`
      );
    }

    // Handle dry run simulation
    if (dryRun) {
      const simulation = {
        wouldDelete: true,
        backupWouldBeCreated: backup,
        targetPath: absolutePath,
        fileSize: stats.size,
      };

      logger.debug('Dry run simulation for deletion', { uri, simulation });

      return {
        success: true,
        dryRun: simulation,
        backupPath: undefined,
        rollbackToken: undefined,
      };
    }

    // Create backup if requested or if rollback token provided
    let backupPath: string | undefined;
    let generatedRollbackToken: string | undefined;

    if (backup || rollbackToken) {
      generatedRollbackToken = rollbackToken || generateRollbackToken();
      backupPath = await createBackup(absolutePath, generatedRollbackToken);

      if (backupPath) {
        logger.debug('Backup created before deletion', {
          originalPath: absolutePath,
          backupPath,
          rollbackToken: generatedRollbackToken,
        });
      }
    }

    // Delete the file
    try {
      await fs.unlink(absolutePath);
    } catch (error) {
      throw createFileOperationError('delete', uri, error);
    }

    logger.info('File deleted successfully', {
      uri,
      size: stats.size,
      backup: !!backupPath,
      rollbackToken: generatedRollbackToken,
    });

    return {
      success: true,
      backupPath: backupPath || undefined,
      rollbackToken: generatedRollbackToken,
      dryRun: undefined,
    };
  } catch (error) {
    logger.error('Error deleting file', {
      uri: params.uri,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof MCPProtocolError) {
      throw error;
    }

    throw createFileOperationError('delete', params.uri, error);
  }
}

/**
 * Performs rollback operation to restore files from backup
 *
 * @param params - Rollback parameters containing the rollback token
 * @returns Promise resolving to rollback result with restored files
 * @throws {MCPProtocolError} For various error conditions
 */
export async function rollback(
  params: RollbackParams
): Promise<RollbackResult> {
  try {
    // Basic parameter check
    if (!params || typeof params.rollbackToken !== 'string') {
      throw new MCPProtocolError(
        MCPErrorCode.InvalidParams,
        'Invalid parameters: rollbackToken is required'
      );
    }

    const { rollbackToken } = params;

    logger.debug('Performing rollback', { rollbackToken });

    const restoredFiles = await performRollback(rollbackToken);

    logger.info('Rollback completed successfully', {
      rollbackToken,
      restoredCount: restoredFiles.length,
    });

    return {
      success: true,
      restoredFiles,
    };
  } catch (error) {
    logger.error('Error performing rollback', {
      rollbackToken: params.rollbackToken,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof MCPProtocolError) {
      throw error;
    }

    throw new MCPProtocolError(
      MCPErrorCode.InternalError,
      `Failed to perform rollback: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Gets the configured project root directory
 */
export function getProjectRoot(): string {
  return PROJECT_ROOT;
}

/**
 * Sets the project root directory (for testing)
 * @internal - Only for testing, not for production use
 */
export function setProjectRootForTesting(newRoot: string): void {
  if (process.env['NODE_ENV'] !== 'test' && process.env['VITEST'] !== 'true') {
    logger.warn('Attempt to change project root outside of test environment', {
      currentRoot: PROJECT_ROOT,
      requestedRoot: newRoot,
    });
    throw new MCPProtocolError(
      MCPErrorCode.PermissionDenied,
      'Project root can only be changed in test environment'
    );
  }
  PROJECT_ROOT = newRoot;
  // Reinitialize backup system with new root
  initializeBackup(PROJECT_ROOT);
  logger.debug('Project root changed for testing', { newRoot });
}

/**
 * Resets project root to default (for testing cleanup)
 * @internal - Only for testing
 */
export function resetProjectRootForTesting(): void {
  PROJECT_ROOT = process.env['SWARM_MCP_PROJECT_ROOT'] || process.cwd();
  // Reinitialize backup system with reset root
  initializeBackup(PROJECT_ROOT);
}
