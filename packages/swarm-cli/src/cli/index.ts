import { realFileSystem, realLogger } from '@ingenyus/swarm-core';
import { Command } from 'commander';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createFeatureCommand } from './commands/feature.command';

/**
 * Main entry point for the generator CLI
 * @function main
 * @returns {Promise<void>} - A promise that resolves when the main function completes
 */
export async function main(): Promise<void> {
  const program = new Command();
  // Explicitly register the feature command
  const featureCmd = createFeatureCommand();

  // Read version from package.json and setup __dirname
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const packageJsonPath = path.join(__dirname, '../package.json');
  const version = JSON.parse(
    realFileSystem.readFileSync(packageJsonPath, 'utf8')
  ).version;

  program.name('swarm').description('@ingenyus/swarm-cli').version(version);
  featureCmd.register(program);

  // Dynamically load all other commands except feature.command.ts/js
  const commandsDir = path.join(__dirname, 'cli', 'commands');
  const files = realFileSystem
    .readdirSync(commandsDir)
    .filter(
      (f) =>
        (f.endsWith('.command.ts') || f.endsWith('.command.js')) &&
        !/^feature\.command\.(ts|js)$/.test(f)
    );

  for (const file of files) {
    // Dynamic import (works with both .ts and .js in dev/build)

    const mod = await import(path.join(commandsDir, file));
    for (const key of Object.keys(mod)) {
      // Look for exported functions that start with 'create' and end with 'Command'
      if (typeof mod[key] === 'function' && /^create.*Command$/.test(key)) {
        const cmd = mod[key]();
        if (cmd && typeof cmd.register === 'function') {
          if ('generator' in cmd) {
            cmd.register(program, cmd.generator);
          } else {
            cmd.register(program);
          }
        }
      }
    }
  }

  await program.parseAsync(process.argv);
}
