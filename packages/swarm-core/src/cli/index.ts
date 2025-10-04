import { Command } from 'commander';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { realFileSystem } from '../utils/filesystem';

/**
 * Main entry point for the CLI
 * @function main
 * @returns {Promise<void>} - A promise that resolves when the main function completes
 */
export async function main(): Promise<void> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const packageJsonPath = path.join(__dirname, '../package.json');
  const version = JSON.parse(
    realFileSystem.readFileSync(packageJsonPath, 'utf8')
  ).version;
  const command = new Command()
    .name('swarm')
    .description('@ingenyus/swarm-cli')
    .version(version);
  const commandsDir = path.join(__dirname, 'cli', 'commands');
  const files = realFileSystem
    .readdirSync(commandsDir)
    .filter((f) => f.endsWith('.command.ts') || f.endsWith('.command.js'));

  for (const file of files) {
    const module = await import(path.join(commandsDir, file));

    registerSubCommands(command, module);
  }

  await command.parseAsync(process.argv);
}

/**
 * Register sub-commands from a module
 * @param command - The main command instance
 * @param module - The imported module containing command functions
 */
function registerSubCommands(command: Command, module: any): void {
  for (const exported of Object.keys(module)) {
    if (
      typeof module[exported] === 'function' &&
      /^create.*Command$/.test(exported)
    ) {
      const subCommand = module[exported]();

      if (subCommand && subCommand instanceof Command) {
        command.addCommand(subCommand);
      }
    }
  }
}
