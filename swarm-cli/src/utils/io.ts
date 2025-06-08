import path from 'path';
import { TYPE_DIRECTORIES } from '../types';
import { IFileSystem } from '../types/filesystem';
import { toPascalCase } from './strings';

/**
 * Recursively copies a directory and its contents.
 * @param fs - The filesystem abstraction
 * @param src - The source directory path
 * @param dest - The destination directory path
 */
export function copyDirectory(
  fs: IFileSystem,
  src: string,
  dest: string
): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(fs, srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param fs - The filesystem abstraction
 * @param dir - The directory path to ensure
 */
export function ensureDirectoryExists(fs: IFileSystem, dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Checks if a feature exists at the specified path.
 * @param fs - The filesystem abstraction
 * @param featurePath - The path to check
 * @returns True if the feature exists
 */
export function featureExists(fs: IFileSystem, featurePath: string): boolean {
  return fs.existsSync(getFeatureDir(featurePath));
}

/**
 * Gets the absolute path to the config directory.
 * @returns The absolute path to the config directory
 */
export function getConfigDir(): string {
  return path.join(process.cwd(), 'config');
}

/**
 * Gets the absolute path to a feature directory.
 * @param featureName - The name of the feature
 * @returns The absolute path to the feature directory
 */
export function getFeatureDir(featureName: string): string {
  return path.join(process.cwd(), 'src', 'features', featureName);
}

/**
 * Gets the appropriate directory path for a feature's import statement.
 * @param featurePath - The full feature path (e.g., "my-feature" or "my-feature/sub-feature")
 * @returns The directory path to use in imports
 */
export function getFeatureImportPath(featurePath: string): string {
  const segments = featurePath.split('/').filter(Boolean);
  const isTopLevel = segments.length === 1;
  return `${segments[0]}/${isTopLevel ? '_core' : segments.slice(1).join('/')}`;
}

/**
 * Gets the appropriate directory for a feature based on its path.
 * @param featurePath - The full feature path
 * @param type - The type of file being generated
 * @returns The target directory and import path
 */
export function getFeatureTargetDir(
  featurePath: string,
  type: string
): { targetDir: string; importPath: string } {
  const segments = featurePath.split('/').filter(Boolean);
  const isTopLevel = segments.length === 1;
  const featureDir = getFeatureDir(featurePath);
  const baseDir = isTopLevel ? '_core' : '';
  const targetDir = path.join(featureDir, baseDir, TYPE_DIRECTORIES[type]);
  const importPath = `@src/features/${segments[0]}/$${
    isTopLevel ? '_core' : segments.slice(1).join('/')
  }/${TYPE_DIRECTORIES[type]}`;
  return { targetDir, importPath };
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
