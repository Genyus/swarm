import { FileSystem, toPascalCase, validateFeaturePath } from '@ingenyus/swarm';
import fs from 'node:fs';
import path from 'path';
import { TYPE_DIRECTORIES } from './constants';

export const realFileSystem: FileSystem = {
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
  fileSystem: FileSystem,
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
  fileSystem: FileSystem,
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
  fileSystem: FileSystem,
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
  fileSystem: FileSystem,
  featurePath: string
): boolean {
  return fileSystem.existsSync(getFeatureDir(fileSystem, featurePath));
}

/**
 * Gets the absolute path to the config directory.
 * @param fileSystem - The filesystem abstraction
 * @returns The absolute path to the config directory
 */
export function getConfigDir(fileSystem: FileSystem): string {
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
  fileSystem: FileSystem,
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
  fileSystem: FileSystem,
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
