import { realFileSystem } from '@ingenyus/swarm-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function getPluginVersion(): string {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const packageJsonPath = path.resolve(__dirname, '../../package.json');
  const version = JSON.parse(
    realFileSystem.readFileSync(packageJsonPath, 'utf8')
  ).version;

  return version;
}
