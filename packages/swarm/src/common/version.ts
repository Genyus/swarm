import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findPackageJson } from './package-utils';

let cachedVersion: string | null = null;

/**
 * Get the version from the package.json file
 * @returns {string} The version
 */
export function getVersion(): string {
  if (cachedVersion) {
    return cachedVersion;
  }

  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const result = findPackageJson(currentDir, {
    packageName: '@ingenyus/swarm',
  });

  if (!result) {
    cachedVersion = '0.1.0';

    return cachedVersion;
  }

  cachedVersion = result.packageJson.version ?? '0.1.0';

  return cachedVersion;
}
