import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Package.json structure
 */
export interface PackageJson {
  name?: string;
  version?: string;
  main?: string;
  module?: string;
  workspaces?: string[] | { packages?: string[] };
  [key: string]: unknown;
}

/**
 * Result of finding a package.json
 */
export interface PackageJsonResult {
  /** Path to the package.json file */
  jsonPath: string;
  /** Path to the directory containing package.json */
  directory: string;
  /** Parsed package.json content */
  packageJson: PackageJson;
}

/**
 * Options for finding package.json
 */
export interface FindPackageJsonOptions {
  /** Optional package name to match */
  packageName?: string;
  /** Whether to return the first package.json found, even if name doesn't match */
  returnFirst?: boolean;
}

/**
 * Find a file or directory by walking up the directory tree from a starting directory
 * @param startDir - The directory to start searching from
 * @param predicate - Function called for each directory, return truthy to stop
 * @returns The directory where predicate returned truthy, or null
 */
function findUp(
  startDir: string,
  predicate: (dir: string) => boolean
): string | null {
  let currentDir = startDir;
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    if (predicate(currentDir)) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);

    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  return null;
}

/**
 * Read and parse a package.json file safely
 * @param packageJsonPath - Path to package.json file
 * @returns Parsed package.json or null if invalid
 */
function readPackageJson(packageJsonPath: string): PackageJson | null {
  try {
    const raw = readFileSync(packageJsonPath, 'utf8');

    return JSON.parse(raw) as PackageJson;
  } catch {
    return null;
  }
}

/**
 * Find a package.json file by walking up the directory tree
 * @param startDir - The directory to start searching from
 * @param options - Options for finding package.json
 * @returns PackageJsonResult with path, directory, and parsed content, or null if not found
 */
export function findPackageJson(
  startDir: string,
  options: FindPackageJsonOptions = {}
): PackageJsonResult | null {
  const { packageName, returnFirst = false } = options;
  const foundDir = findUp(startDir, (dir) => {
    const packageJsonPath = path.join(dir, 'package.json');

    if (!existsSync(packageJsonPath)) {
      return false;
    }

    if (!packageName) {
      const pkg = readPackageJson(packageJsonPath);

      if (pkg) {
        return true;
      }

      return false;
    }

    const pkg = readPackageJson(packageJsonPath);

    if (pkg?.name === packageName) {
      return true;
    }

    if (returnFirst && pkg) {
      return true;
    }

    return false;
  });

  if (!foundDir) {
    return null;
  }

  const packageJsonPath = path.join(foundDir, 'package.json');
  const packageJson = readPackageJson(packageJsonPath);

  if (!packageJson) {
    return null;
  }

  if (packageName && !returnFirst && packageJson.name !== packageName) {
    return null;
  }

  return {
    jsonPath: packageJsonPath,
    directory: foundDir,
    packageJson,
  };
}

/**
 * Find a package directory by name by walking up the directory tree
 * @param startDir - The directory to start searching from
 * @param packageName - The name of the package to find
 * @returns Path to the package directory or null if not found
 */
export function findPackageDirectory(
  startDir: string,
  packageName: string
): string | null {
  const result = findPackageJson(startDir, { packageName });

  return result?.directory ?? null;
}

/**
 * Find a package.json file path by walking up the directory tree
 * @param startDir - The directory to start searching from
 * @param packageName - Optional package name to match
 * @returns Path to package.json file or null if not found
 */
export function findPackageJsonPath(
  startDir: string,
  packageName?: string
): string | null {
  const result = findPackageJson(startDir, { packageName });

  return result?.jsonPath ?? null;
}

/**
 * Check if a directory has workspace configuration (monorepo indicators)
 * @param dir - Directory to check
 * @returns True if workspace configuration is detected
 */
export function hasWorkspaceConfig(dir: string): boolean {
  return (
    existsSync(path.join(dir, 'pnpm-workspace.yaml')) ||
    existsSync(path.join(dir, 'lerna.json')) ||
    existsSync(path.join(dir, 'nx.json')) ||
    existsSync(path.join(dir, 'rush.json')) ||
    (() => {
      const packageJsonPath = path.join(dir, 'package.json');

      if (!existsSync(packageJsonPath)) {
        return false;
      }

      const pkg = readPackageJson(packageJsonPath);

      if (!pkg) {
        return false;
      }

      if (Array.isArray(pkg.workspaces) && pkg.workspaces.length > 0) {
        return true;
      }

      if (
        typeof pkg.workspaces === 'object' &&
        pkg.workspaces !== null &&
        'packages' in pkg.workspaces &&
        Array.isArray(pkg.workspaces.packages) &&
        pkg.workspaces.packages.length > 0
      ) {
        return true;
      }

      return false;
    })()
  );
}
