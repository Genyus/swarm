import path from 'node:path';
import { z } from 'zod';
import { MCPErrorCode, MCPProtocolError } from '../types/mcp.js';

/**
 * Maximum allowed file size in bytes (400KB as recommended by security research)
 */
export const MAX_FILE_SIZE = 400 * 1024;

/**
 * Validates and resolves a file path within the project directory.
 * Prevents directory traversal attacks and ensures the path stays within bounds.
 *
 * @param inputPath - The requested file path (relative to project root)
 * @param projectRoot - The absolute path to the project root directory
 * @returns The absolute, canonicalized path within the project directory
 * @throws {MCPProtocolError} If the path is invalid or attempts directory traversal
 */
export function validateProjectFilePath(
  inputPath: string,
  projectRoot: string
): string {
  if (typeof inputPath !== 'string' || inputPath.trim() === '') {
    throw new MCPProtocolError(
      MCPErrorCode.InvalidParams,
      'File path must be a non-empty string'
    );
  }

  if (inputPath.includes('\0')) {
    throw new MCPProtocolError(
      MCPErrorCode.ValidationError,
      'Null byte detected in file path'
    );
  }
  if (path.isAbsolute(inputPath)) {
    throw new MCPProtocolError(
      MCPErrorCode.PermissionDenied,
      'Absolute paths are not allowed. Use paths relative to project root.'
    );
  }

  const normalizedPath = path.normalize(inputPath);

  let resolvedPath: string;
  try {
    resolvedPath = path.resolve(projectRoot, normalizedPath);
  } catch {
    throw new MCPProtocolError(
      MCPErrorCode.ValidationError,
      `Invalid file path: ${inputPath}`
    );
  }
  const projectRootWithSep = projectRoot + path.sep;
  if (
    !resolvedPath.startsWith(projectRootWithSep) &&
    resolvedPath !== projectRoot
  ) {
    throw new MCPProtocolError(
      MCPErrorCode.PermissionDenied,
      `Access denied: Path "${inputPath}" attempts to access files outside project directory`
    );
  }

  return resolvedPath;
}

export const FileUriSchema = z.object({
  uri: z
    .string()
    .min(1, 'File URI cannot be empty')
    .refine(uri => !uri.includes('\0'), 'File URI cannot contain null bytes')
    .refine(
      uri => !path.isAbsolute(uri),
      'File URI must be relative to project root'
    ),
});

export const WriteFileSchema = z.object({
  uri: z
    .string()
    .min(1, 'File URI cannot be empty')
    .refine(uri => !uri.includes('\0'), 'File URI cannot contain null bytes')
    .refine(
      uri => !path.isAbsolute(uri),
      'File URI must be relative to project root'
    ),
  contents: z.string(),
  mimeType: z.string().optional(),
  backup: z.boolean().optional(),
  dryRun: z.boolean().optional(),
  rollbackToken: z.string().optional(),
});

export const ListDirectorySchema = z.object({
  uri: z
    .string()
    .min(1, 'Directory URI cannot be empty')
    .refine(
      uri => !uri.includes('\0'),
      'Directory URI cannot contain null bytes'
    )
    .refine(
      uri => !path.isAbsolute(uri),
      'Directory URI must be relative to project root'
    ),
  recursive: z.boolean().optional(),
  maxDepth: z.number().min(1).max(10).optional(), // Reasonable limits
  includeSize: z.boolean().optional(),
  includePermissions: z.boolean().optional(),
  sortBy: z.enum(['name', 'size', 'type', 'modified']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  filter: z
    .object({
      namePattern: z.string().optional(),
      extensions: z.array(z.string()).optional(),
      minSize: z.number().min(0).optional(),
      maxSize: z.number().min(0).optional(),
      type: z.enum(['file', 'directory']).optional(),
    })
    .optional(),
  pagination: z
    .object({
      offset: z.number().min(0).optional(),
      limit: z.number().min(1).max(1000).optional(), // Reasonable limits
    })
    .optional(),
});

export const DeleteFileSchema = z.object({
  uri: z
    .string()
    .min(1, 'File URI cannot be empty')
    .refine(uri => !uri.includes('\0'), 'File URI cannot contain null bytes')
    .refine(
      uri => !path.isAbsolute(uri),
      'File URI must be relative to project root'
    ),
  backup: z.boolean().optional(),
  dryRun: z.boolean().optional(),
  rollbackToken: z.string().optional(),
});

/**
 * Validates that a file size is within acceptable limits
 *
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size (defaults to MAX_FILE_SIZE)
 * @throws {MCPProtocolError} If file is too large
 */
export function validateFileSize(
  size: number,
  maxSize: number = MAX_FILE_SIZE
): void {
  if (size > maxSize) {
    throw new MCPProtocolError(
      MCPErrorCode.ValidationError,
      `File too large (${size} bytes). Maximum allowed size is ${maxSize} bytes (${Math.round(maxSize / 1024)}KB).`
    );
  }
}

/**
 * Validates MIME type and determines if file should be readable as text
 *
 * @param mimeType - MIME type of the file
 * @returns true if file should be read as text, false for binary
 */
export function shouldReadAsText(mimeType: string): boolean {
  const textTypes = [
    'text/',
    'application/json',
    'application/javascript',
    'application/typescript',
    'application/xml',
    'application/yaml',
    'application/x-yaml',
  ];

  return textTypes.some(type => mimeType.startsWith(type));
}

/**
 * Sanitizes file contents for safe transmission over MCP
 *
 * @param contents - Raw file contents
 * @param mimeType - MIME type of the file
 * @returns Sanitized contents suitable for MCP transmission
 */
export function sanitizeFileContents(
  contents: string,
  mimeType: string
): string {
  if (!shouldReadAsText(mimeType)) {
    return `[Binary file: ${contents.length} bytes, MIME type: ${mimeType}]`;
  }

  // For very large text files, truncate with indication
  const maxDisplayLength = 50000; // 50KB of text content
  if (contents.length > maxDisplayLength) {
    return (
      contents.substring(0, maxDisplayLength) +
      `\n\n[Content truncated - file is ${contents.length} characters, showing first ${maxDisplayLength}]`
    );
  }

  return contents;
}

/**
 * Creates a standardized error for file operation failures
 *
 * @param operation - The operation that failed (e.g., 'read', 'write')
 * @param filePath - The file path that was being accessed
 * @param originalError - The original error that occurred
 * @returns MCPProtocolError with appropriate code and message
 */
export function createFileOperationError(
  operation: string,
  filePath: string,
  originalError: unknown
): MCPProtocolError {
  const message =
    originalError instanceof Error
      ? originalError.message
      : String(originalError);

  // Determine appropriate error code based on the error
  if (message.includes('ENOENT') || message.includes('not found')) {
    return new MCPProtocolError(
      MCPErrorCode.ResourceNotFound,
      `File not found: ${filePath}`
    );
  }

  if (message.includes('EACCES') || message.includes('permission denied')) {
    return new MCPProtocolError(
      MCPErrorCode.PermissionDenied,
      `Permission denied accessing file: ${filePath}`
    );
  }

  if (message.includes('EISDIR') || message.includes('is a directory')) {
    return new MCPProtocolError(
      MCPErrorCode.InvalidParams,
      `Path is a directory, not a file: ${filePath}`
    );
  }

  // Generic error for other cases
  return new MCPProtocolError(
    MCPErrorCode.InternalError,
    `Failed to ${operation} file: ${filePath}. ${message}`
  );
}
