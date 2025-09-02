import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  MCPErrorCode,
  MCPProtocolError,
} from '../../../src/server/types/mcp.js';
import {
  createFileOperationError,
  FileUriSchema,
  MAX_FILE_SIZE,
  sanitizeFileContents,
  shouldReadAsText,
  validateFileSize,
  validateProjectFilePath,
  WriteFileSchema,
} from '../../../src/server/utils/validation.js';

describe('Validation Utilities', () => {
  const testProjectRoot = '/test/project';

  describe('validateProjectFilePath', () => {
    it('should validate and resolve safe paths', () => {
      const testCases = [
        'file.txt',
        'dir/file.txt',
        'dir/subdir/file.txt',
        './file.txt',
        'dir/../file.txt',
      ];

      for (const inputPath of testCases) {
        const result = validateProjectFilePath(inputPath, testProjectRoot);
        expect(result).toMatch(
          new RegExp(
            `^${testProjectRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
          )
        );
      }
    });

    it('should reject empty or invalid paths', () => {
      const invalidCases = ['', '   ', '\t', '\n'];

      for (const invalidPath of invalidCases) {
        expect(() =>
          validateProjectFilePath(invalidPath, testProjectRoot)
        ).toThrow(MCPProtocolError);
      }
    });

    it('should reject paths with null bytes', () => {
      const maliciousPaths = [
        'file\0.txt',
        'file.txt\0',
        '\0file.txt',
        'dir/\0file.txt',
      ];

      for (const maliciousPath of maliciousPaths) {
        expect(() =>
          validateProjectFilePath(maliciousPath, testProjectRoot)
        ).toThrow(MCPProtocolError);
        expect(() =>
          validateProjectFilePath(maliciousPath, testProjectRoot)
        ).toThrow(/Null byte detected/);
      }
    });

    it('should reject absolute paths', () => {
      const absolutePaths = ['/etc/passwd', '/home/user/file.txt'];

      // Only test Unix-style absolute paths since path.isAbsolute()
      // behaves differently on different platforms
      for (const absolutePath of absolutePaths) {
        expect(() =>
          validateProjectFilePath(absolutePath, testProjectRoot)
        ).toThrow(MCPProtocolError);
        expect(() =>
          validateProjectFilePath(absolutePath, testProjectRoot)
        ).toThrow(/Absolute paths are not allowed/);
      }
    });

    it('should reject directory traversal attempts', () => {
      const traversalPaths = [
        '../file.txt',
        '../../etc/passwd',
        '../../../etc/passwd',
        'dir/../../../etc/passwd',
      ];

      for (const traversalPath of traversalPaths) {
        expect(() =>
          validateProjectFilePath(traversalPath, testProjectRoot)
        ).toThrow(MCPProtocolError);
        expect(() =>
          validateProjectFilePath(traversalPath, testProjectRoot)
        ).toThrow(/outside project directory/);
      }
    });

    it('should handle complex path normalization', () => {
      const complexPaths = [
        'dir//file.txt',
        'dir/./file.txt',
        'dir1/../dir2/file.txt',
        './dir/./file.txt',
      ];

      for (const complexPath of complexPaths) {
        const result = validateProjectFilePath(complexPath, testProjectRoot);
        expect(result).toMatch(
          new RegExp(
            `^${testProjectRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
          )
        );
      }
    });

    it('should return absolute resolved paths', () => {
      const inputPath = 'dir/file.txt';
      const result = validateProjectFilePath(inputPath, testProjectRoot);

      expect(path.isAbsolute(result)).toBe(true);
      expect(result).toBe(path.join(testProjectRoot, inputPath));
    });
  });

  describe('validateFileSize', () => {
    it('should accept files within size limit', () => {
      const validSizes = [
        0,
        1024,
        100 * 1024,
        MAX_FILE_SIZE - 1,
        MAX_FILE_SIZE,
      ];

      for (const size of validSizes) {
        expect(() => validateFileSize(size)).not.toThrow();
      }
    });

    it('should reject files exceeding size limit', () => {
      const invalidSizes = [
        MAX_FILE_SIZE + 1,
        MAX_FILE_SIZE * 2,
        1024 * 1024 * 10,
      ];

      for (const size of invalidSizes) {
        expect(() => validateFileSize(size)).toThrow(MCPProtocolError);
        expect(() => validateFileSize(size)).toThrow(/File too large/);
      }
    });

    it('should accept custom size limits', () => {
      const customLimit = 1024;

      expect(() => validateFileSize(500, customLimit)).not.toThrow();
      expect(() => validateFileSize(customLimit, customLimit)).not.toThrow();
      expect(() => validateFileSize(customLimit + 1, customLimit)).toThrow(
        MCPProtocolError
      );
    });
  });

  describe('shouldReadAsText', () => {
    it('should identify text MIME types', () => {
      const textTypes = [
        'text/plain',
        'text/html',
        'text/css',
        'text/javascript',
        'application/json',
        'application/javascript',
        'application/typescript',
        'application/xml',
        'application/yaml',
        'application/x-yaml',
      ];

      for (const mimeType of textTypes) {
        expect(shouldReadAsText(mimeType)).toBe(true);
      }
    });

    it('should identify binary MIME types', () => {
      const binaryTypes = [
        'image/png',
        'image/jpeg',
        'application/octet-stream',
        'application/pdf',
        'video/mp4',
        'audio/mpeg',
        'application/zip',
        'application/x-executable',
      ];

      for (const mimeType of binaryTypes) {
        expect(shouldReadAsText(mimeType)).toBe(false);
      }
    });
  });

  describe('sanitizeFileContents', () => {
    it('should pass through text content for text MIME types', () => {
      const textContent = 'Hello, world!\nThis is a test file.';
      const result = sanitizeFileContents(textContent, 'text/plain');

      expect(result).toBe(textContent);
    });

    it('should replace binary content with descriptive message', () => {
      const binaryContent = 'binary data here';
      const result = sanitizeFileContents(binaryContent, 'image/png');

      expect(result).toBe('[Binary file: 16 bytes, MIME type: image/png]');
    });

    it('should truncate very large text files', () => {
      const largeContent = 'x'.repeat(60000); // 60KB
      const result = sanitizeFileContents(largeContent, 'text/plain');

      expect(result.length).toBeLessThan(largeContent.length);
      expect(result).toContain('[Content truncated');
      expect(result).toContain('showing first 50000');
    });

    it('should not truncate reasonably sized text files', () => {
      const reasonableContent = 'x'.repeat(30000); // 30KB
      const result = sanitizeFileContents(reasonableContent, 'text/plain');

      expect(result).toBe(reasonableContent);
    });
  });

  describe('createFileOperationError', () => {
    it('should create ResourceNotFound errors for ENOENT', () => {
      const error = new Error('ENOENT: no such file or directory');
      const result = createFileOperationError('read', 'test.txt', error);

      expect(result).toBeInstanceOf(MCPProtocolError);
      expect(result.code).toBe(MCPErrorCode.ResourceNotFound);
      expect(result.message).toContain('File not found');
    });

    it('should create PermissionDenied errors for EACCES', () => {
      const error = new Error('EACCES: permission denied');
      const result = createFileOperationError('read', 'test.txt', error);

      expect(result).toBeInstanceOf(MCPProtocolError);
      expect(result.code).toBe(MCPErrorCode.PermissionDenied);
      expect(result.message).toContain('Permission denied');
    });

    it('should create InvalidParams errors for EISDIR', () => {
      const error = new Error('EISDIR: illegal operation on a directory');
      const result = createFileOperationError('read', 'directory', error);

      expect(result).toBeInstanceOf(MCPProtocolError);
      expect(result.code).toBe(MCPErrorCode.InvalidParams);
      expect(result.message).toContain('is a directory');
    });

    it('should create InternalError for unknown errors', () => {
      const error = new Error('Unknown filesystem error');
      const result = createFileOperationError('read', 'test.txt', error);

      expect(result).toBeInstanceOf(MCPProtocolError);
      expect(result.code).toBe(MCPErrorCode.InternalError);
      expect(result.message).toContain('Failed to read');
    });

    it('should handle non-Error objects', () => {
      const error = 'String error message';
      const result = createFileOperationError('write', 'test.txt', error);

      expect(result).toBeInstanceOf(MCPProtocolError);
      expect(result.message).toContain('String error message');
    });
  });

  describe('Zod Schemas', () => {
    describe('FileUriSchema', () => {
      it('should validate correct file URIs', () => {
        const validUris = [
          { uri: 'file.txt' },
          { uri: 'dir/file.txt' },
          { uri: 'dir/subdir/file.txt' },
          { uri: './file.txt' },
        ];

        for (const uriObj of validUris) {
          expect(() => FileUriSchema.parse(uriObj)).not.toThrow();
        }
      });

      it('should reject invalid file URIs', () => {
        const invalidUris = [
          { uri: '' },
          { uri: '/absolute/path.txt' },
          { uri: 'file\0.txt' },
          // Note: Windows path handling varies by platform, so we test only Unix-style paths
        ];

        for (const uriObj of invalidUris) {
          expect(() => FileUriSchema.parse(uriObj)).toThrow();
        }
      });
    });

    describe('WriteFileSchema', () => {
      it('should validate correct write file parameters', () => {
        const validParams = [
          { uri: 'file.txt', contents: 'Hello' },
          { uri: 'file.txt', contents: 'Hello', mimeType: 'text/plain' },
          { uri: 'dir/file.txt', contents: '' },
        ];

        for (const params of validParams) {
          expect(() => WriteFileSchema.parse(params)).not.toThrow();
        }
      });

      it('should reject invalid write file parameters', () => {
        const invalidParams = [
          { uri: '', contents: 'Hello' },
          { uri: '/absolute.txt', contents: 'Hello' },
          { uri: 'file.txt' }, // missing contents
          { contents: 'Hello' }, // missing uri
        ];

        for (const params of invalidParams) {
          expect(() => WriteFileSchema.parse(params)).toThrow();
        }
      });
    });
  });
});
