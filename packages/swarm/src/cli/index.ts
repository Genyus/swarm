import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { realFileSystem } from '../common/filesystem';
import { AppGenerator } from '../generator';
import { SignaleLogger } from '../logger/signale-logger';
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

  // Check if we're in a project context
  const hasConfig = fs.existsSync('swarm.config.json');
  const hasPackageJson = fs.existsSync('package.json');
  const isInProject = hasConfig || hasPackageJson;

  try {
    if (!isInProject) {
      // Only show create command when not in a project
      const appGen = new AppGenerator(realFileSystem, new SignaleLogger());
      const createCmd = new Command('create')
        .description(appGen.description)
        .argument(
          '<name>',
          'Project name (will be used for directory and package name)'
        )
        .option(
          '-t, --template <template>',
          'GitHub repository path or URL to use as template'
        )
        .option(
          '-d, --target-dir [target-dir]',
          'Target directory (defaults to project name)'
        )
        .action(async (name: string, options: any) => {
          try {
            if (!options.template) {
              console.error(
                '❌ Error: Template is required. Use --template to specify a GitHub repository.'
              );
              process.exit(1);
            }
            await appGen.generate({
              name,
              template: options.template,
              targetDir: options.targetDir,
            });
          } catch (err: any) {
            console.error('❌ Error:', err.message);
            process.exit(1);
          }
        });
      command.addCommand(createCmd);
    } else {
      // Show all plugin generators when in a project
      const commandManager = new CommandManager();
      await commandManager.initialize();
      commandManager.registerCommands(command);
    }

    await command.parseAsync(process.argv);
  } catch (error) {
    console.error(
      '❌ Error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    process.exit(1);
  }
}

// Execute main function if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
