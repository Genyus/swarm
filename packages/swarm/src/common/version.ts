import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let cachedVersion: string | null = null;

/**
 * Get the Swarm version from the package.json file
 * @returns {string} The Swarm version
 */
export function getSwarmVersion(): string {
  if (cachedVersion) {
    return cachedVersion;
  }

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const packageJsonPath = path.resolve(currentDir, '../../../package.json');

  try {
    const raw = readFileSync(packageJsonPath, 'utf8');
    const pkg = JSON.parse(raw) as { version?: string };
    cachedVersion = pkg.version ?? '0.1.0';
  } catch (err) {
    console.error(err);
    cachedVersion = '0.1.0';
  }

  return cachedVersion;
}
