import {
  IFileSystem,
  toPascalCase,
  validateFeaturePath,
} from '@ingenyus/swarm-core';
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TYPE_DIRECTORIES } from '../types/constants';

export const realFileSystem: IFileSystem = {
  readFileSync: fs.readFileSync,
  writeFileSync: fs.writeFileSync,
  existsSync: fs.existsSync,
  copyFileSync: fs.copyFileSync,
  mkdirSync: fs.mkdirSync,
  readdirSync: fs.readdirSync,
  statSync: fs.statSync,
};

/**
 * Finds the Wasp application root directory by searching upwards for .wasproot file.
 * @param fileSystem - The filesystem abstraction
 * @param startDir - The directory to start searching from (defaults to current working directory)
 * @returns The absolute path to the Wasp root directory
 * @throws Error if .wasproot file is not found
 */
export function findWaspRoot(
  fileSystem: IFileSystem,
  startDir: string = process.cwd()
): string {
  const startDirPath = path.resolve(startDir);
  let currentDirPath = startDirPath;
  const root = path.parse(currentDirPath).root;

  while (currentDirPath !== root) {
    const waspRootPath = path.join(currentDirPath, '.wasproot');
    if (fileSystem.existsSync(waspRootPath)) {
      return currentDirPath;
    }
    currentDirPath = path.dirname(currentDirPath);
  }

  throw new Error(
    `Couldn't find Wasp application root from ${startDirPath}. Make sure you are running this command from within a Wasp project directory.`
  );
}

/**
 * Recursively copies a directory and its contents.
 * @param fileSystem - The filesystem abstraction
 * @param src - The source directory path
 * @param dest - The destination directory path
 */
export function copyDirectory(
  fileSystem: IFileSystem,
  src: string,
  dest: string
): void {
  if (!fileSystem.existsSync(dest)) {
    fileSystem.mkdirSync(dest, { recursive: true });
  }
  const entries = fileSystem.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(fileSystem, srcPath, destPath);
    } else {
      fileSystem.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param fileSystem - The filesystem abstraction
 * @param dir - The directory path to ensure
 */
export function ensureDirectoryExists(
  fileSystem: IFileSystem,
  dir: string
): void {
  if (!fileSystem.existsSync(dir)) {
    fileSystem.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Checks if a feature exists at the specified path.
 * @param fileSystem - The filesystem abstraction
 * @param featurePath - The path to check
 * @returns True if the feature exists
 */
export function featureExists(
  fileSystem: IFileSystem,
  featurePath: string
): boolean {
  return fileSystem.existsSync(getFeatureDir(fileSystem, featurePath));
}

/**
 * Gets the absolute path to the config directory.
 * @param fileSystem - The filesystem abstraction
 * @returns The absolute path to the config directory
 */
export function getConfigDir(fileSystem: IFileSystem): string {
  const waspRoot = findWaspRoot(fileSystem);
  return path.join(waspRoot, 'config');
}

/**
 * Normalises the segments of a feature path to always be prefixed by "features".
 * @param featurePath - The feature path to normalise
 * @returns The normalised feature path with "features" prefix
 */
export function normaliseFeaturePath(featurePath: string): string {
  const segments = validateFeaturePath(featurePath);
  const normalisedSegments: string[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const previousSegment = normalisedSegments[normalisedSegments.length - 1];

    if (previousSegment !== 'features' && segment !== 'features') {
      normalisedSegments.push('features');
    }
    normalisedSegments.push(segment);
  }

  return normalisedSegments.join('/');
}

/**
 * Gets the absolute path to a feature directory.
 * @param fileSystem - The filesystem abstraction
 * @param featureName - The name of the feature
 * @returns The absolute path to the feature directory
 */
export function getFeatureDir(
  fileSystem: IFileSystem,
  featureName: string
): string {
  const waspRoot = findWaspRoot(fileSystem);
  const normalisedPath = normaliseFeaturePath(featureName);

  return path.join(waspRoot, 'src', normalisedPath);
}

/**
 * Gets the appropriate directory path for a feature's import statement.
 * @param featurePath - The full feature path (e.g., "my-feature" or "my-feature/sub-feature")
 * @returns The directory path to use in imports
 */
export function getFeatureImportPath(featurePath: string): string {
  const segments = validateFeaturePath(featurePath);
  return segments.join('/');
}

/**
 * Gets the appropriate directory for a feature based on its path.
 * @param fileSystem - The filesystem abstraction
 * @param featurePath - The full feature path
 * @param type - The type of file being generated
 * @returns The target directory and import path
 */
export function getFeatureTargetDir(
  fileSystem: IFileSystem,
  featurePath: string,
  type: string
): { targetDirectory: string; importDirectory: string } {
  validateFeaturePath(featurePath);

  const normalisedPath = normaliseFeaturePath(featurePath);
  const featureDir = getFeatureDir(fileSystem, normalisedPath);
  const typeKey = type.toLowerCase();
  const typeDirectory = TYPE_DIRECTORIES[typeKey];
  const targetDirectory = path.join(featureDir, typeDirectory);
  const importDirectory = `@src/${normalisedPath}/${typeDirectory}`;

  return { targetDirectory, importDirectory };
}

/**
 * Generates a route component name from a route path.
 * @param routePath - The route path
 * @returns The generated component name
 */
export function getRouteNameFromPath(routePath: string): string {
  const lastSegment = routePath.split('/').filter(Boolean).pop() || 'index';
  const cleanSegment = lastSegment.replace(/[:*]/g, '');
  return `${toPascalCase(cleanSegment)}Page`;
}

/**
 * Gets the absolute path to the application root directory.
 * Returns the src directory when running from source, or dist directory when running from built distribution.
 * This function provides a consistent root path regardless of which module calls it.
 * @param fileSystem - The filesystem abstraction
 * @returns The absolute path to the application root directory
 */
export function getAppRootDir(fileSystem: IFileSystem): string {
  // Start from this file's location
  const currentFile = fileURLToPath(import.meta.url);
  let currentDir = path.dirname(currentFile);

  // Walk up the directory tree to find the root
  while (currentDir !== path.dirname(currentDir)) {
    // Check if we're in a src or dist directory
    const dirName = path.basename(currentDir);

    if (dirName === 'src' || dirName === 'dist') {
      return currentDir;
    }

    // Also check if we find package.json (fallback)
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fileSystem.existsSync(packageJsonPath)) {
      // If we found package.json, check if src or dist exists
      const srcPath = path.join(currentDir, 'src');
      const distPath = path.join(currentDir, 'dist');

      if (fileSystem.existsSync(distPath)) {
        return distPath;
      } else if (fileSystem.existsSync(srcPath)) {
        return srcPath;
      }
    }

    currentDir = path.dirname(currentDir);
  }

  throw new Error('Could not determine application root directory');
}

/**
 * Gets the absolute path to the templates directory.
 * @param fileSystem - The filesystem abstraction
 * @returns The absolute path to the templates directory
 */
export function getTemplatesDir(fileSystem: IFileSystem): string {
  const appRoot = getAppRootDir(fileSystem);
  return path.join(appRoot, 'templates');
}
