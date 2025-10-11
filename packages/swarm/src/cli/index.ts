import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { CommandManager } from './command-manager';

/**
 * Main entry point for the CLI
 * @function main
 * @returns {Promise<void>} - A promise that resolves when the main function completes
 */
export async function main(): Promise<void> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const packageJsonPath = path.join(__dirname, '../../package.json');
  const version = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).version;
  const command = new Command()
    .name('swarm')
    .description('Swarm generator command-line interface')
    .version(version);
  const commandManager = new CommandManager();

  try {
    await commandManager.initialize();
    commandManager.registerCommands(command);
    await command.parseAsync(process.argv);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('No configuration file found')
    ) {
      console.error('❌ Swarm configuration not found');
      console.error('');
      console.error('To get started with Swarm:');
      console.error('1. Create a swarm.config.json file in your project root');
      console.error('2. Add your plugin configuration');
      console.error('');
      console.error('Example configuration:');
      console.error(
        JSON.stringify(
          {
            plugins: {
              wasp: {
                enabled: true,
                generators: {
                  api: { enabled: true },
                  job: { enabled: true },
                },
              },
            },
          },
          null,
          2
        )
      );
      console.error('');
      console.error(
        'For more information, visit: https://github.com/your-org/swarm'
      );
      process.exit(1);
    } else {
      console.error(
        '❌ Error:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      process.exit(1);
    }
  }
}

// Execute main function if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
