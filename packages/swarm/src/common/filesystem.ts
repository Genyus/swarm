import type { Dirent, ObjectEncodingOptions, Stats } from 'node:fs';
import fs from 'node:fs';

/**
 * Interface for file system operations
 * @interface FileSystem
 * @property {Function} readFileSync - Read a file
 * @property {Function} writeFileSync - Write to a file
 * @property {Function} existsSync - Check if a file exists
 * @property {Function} copyFileSync - Copy a file
 * @property {Function} mkdirSync - Create a directory
 * @property {Function} readdirSync - Read directory contents
 */
export interface FileSystem {
  /**
   * Read a file
   * @param {string} path - The path to the file
   * @param {string} encoding - The encoding of the file
   * @returns {string} - The contents of the file
   */
  readFileSync(path: string, encoding: BufferEncoding): string;

  /**
   * Write to a file
   * @param {string} path - The path to the file
   * @param {string} data - The data to write to the file
   */
  writeFileSync(path: string, data: string): void;

  /**
   * Write to a file
   * @param {string} path - The path to the file
   * @param {string} data - The data to write to the file
   * @param {string} encoding - The encoding of the file
   */
  writeFileSync(path: string, data: string, encoding: BufferEncoding): void;

  /**
   * Check if a file exists
   * @param {string} path - The path to the file
   * @returns {boolean} - True if the file exists, false otherwise
   */
  existsSync(path: string): boolean;

  /**
   * Copy a file
   * @param {string} src - The source file path
   * @param {string} dest - The destination file path
   */
  copyFileSync(src: string, dest: string): void;

  /**
   * Create a directory
   * @param {string} path - The path to the directory
   * @param {object} [options] - Options for directory creation (e.g., recursive)
   */
  mkdirSync(path: string, options?: { recursive?: boolean }): void;

  /**
   * Read directory contents
   * @param {string} path - The path to the directory
   * @param {object} options - Options for reading directory (must be { withFileTypes: true })
   * @returns {Dirent[]} - The directory entries
   */
  readdirSync(
    path: string,
    options:
      | ObjectEncodingOptions
      | { withFileTypes: true; recursive?: boolean | undefined }
  ): Dirent[];

  readdirSync(
    path: string,
    options?:
      | {
          encoding: BufferEncoding | null;
          withFileTypes?: false | undefined;
          recursive?: boolean | undefined;
        }
      | BufferEncoding
      | null
  ): string[];

  /**
   * Get file status
   * @param {string} path - The path to the file
   * @returns {Stats} - The file status
   */
  statSync(path: string): Stats;
}

/**
 * Real file system implementation using Node.js fs module
 */
export const realFileSystem: FileSystem = {
  readFileSync: fs.readFileSync,
  writeFileSync: fs.writeFileSync,
  existsSync: fs.existsSync,
  copyFileSync: fs.copyFileSync,
  mkdirSync: fs.mkdirSync,
  readdirSync: fs.readdirSync,
  statSync: fs.statSync,
};
