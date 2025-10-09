import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { realFileSystem } from './filesystem';

export function getPluginVersion(): string {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // Find the package root by looking for package.json in parent directories
  let currentDir = __dirname;
  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (realFileSystem.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          realFileSystem.readFileSync(packageJsonPath, 'utf8')
        );
        // Check if this is the swarm-wasp package
        if (packageJson.name === '@ingenyus/swarm-wasp') {
          return packageJson.version;
        }
      } catch (e) {
        // Continue searching if package.json is invalid
      }
    }
    currentDir = path.dirname(currentDir);
  }

  // Fallback to a default version if package.json is not found
  return '0.1.0';
}
