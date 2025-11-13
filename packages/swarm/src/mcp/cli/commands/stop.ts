import { Command } from 'commander';
import { getCLILogger } from '../../../cli/cli-logger';
import { ServerManager } from '../server-manager';

interface StopOptions {
  force?: boolean;
}

export function createStopCommand(serverManager: ServerManager): Command {
  const logger = getCLILogger();
  return new Command('stop')
    .description('Stop the MCP server')
    .option('--force', 'Force stop the server (may cause data loss)')
    .action(async (options: StopOptions) => {
      try {
        if (!serverManager.isServerRunning()) {
          logger.info('Server is not currently running');
          return;
        }

        if (options.force) {
          logger.info('Force stopping server...');
        }

        await serverManager.stop();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`Failed to stop server: ${errorMessage}`);

        if (options.force) {
          logger.info('Force killing server process...');
          process.exit(1);
        } else {
          process.exit(1);
        }
      }
    });
}
