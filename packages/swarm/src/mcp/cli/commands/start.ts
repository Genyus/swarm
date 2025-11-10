import { Command } from 'commander';
import { getCLILogger } from '../../../cli/cli-logger';
import { ServerManager } from '../server-manager';

export function createStartCommand(serverManager: ServerManager): Command {
  const logger = getCLILogger();

  return new Command('start')
    .description('Start the MCP server in stdio mode')
    .option('-c, --config <path>', 'Path to configuration file')
    .action(async (options: { config?: string }) => {
      try {
        await serverManager.start(options.config);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        logger.error(`Failed to start server: ${errorMessage}`);
        process.exit(1);
      }
    });
}
