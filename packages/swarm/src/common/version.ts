import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findPackageJson } from './package-utils';

const versionCache = new Map<string, string>();

/**
 * Get the version from the package.json file
 * @param packageName - Optional package name to get version for. Defaults to '@ingenyus/swarm'
 * @param startDir - Optional directory to start searching from. Defaults to the current file's directory
 * @returns {string} The version
 */
export function getVersion(
  packageName: string = '@ingenyus/swarm',
  startDir?: string
): string {
  const cacheKey = `${packageName}:${startDir ?? 'default'}`;

  if (versionCache.has(cacheKey)) {
    return versionCache.get(cacheKey)!;
  }

  const searchDir = startDir ?? path.dirname(fileURLToPath(import.meta.url));
  const result = findPackageJson(searchDir, {
    packageName,
  });
  const version = result?.packageJson.version ?? '0.1.0';

  versionCache.set(cacheKey, version);

  return version;
}
