import { Command } from 'commander';
import { getCLILogger } from '../../../cli/cli-logger';
import { ServerManager } from '../server-manager';

interface StatusOptions {
  json?: boolean;
}

export function createStatusCommand(serverManager: ServerManager): Command {
  const logger = getCLILogger();
  return new Command('status')
    .description('Check server status')
    .option('--json', 'Output status in JSON format')
    .action((options: StatusOptions) => {
      try {
        const status = serverManager.getStatus();

        if (options.json) {
          logger.info(JSON.stringify(status, null, 2));
          return;
        }

        logger.info('Swarm MCP Server Status');
        logger.info('========================');

        if (status.isRunning) {
          logger.info(`Status: Running`);
          logger.info(`PID: ${status.pid}`);
          if (status.uptime) {
            const hours = Math.floor(status.uptime / 3600);
            const minutes = Math.floor((status.uptime % 3600) / 60);
            const seconds = Math.floor(status.uptime % 60);
            logger.info(`Uptime: ${hours}h ${minutes}m ${seconds}s`);
          }
        } else {
          logger.info(`Status: Not running`);
        }

        logger.info('========================');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`Failed to get server status: ${errorMessage}`);
        process.exit(1);
      }
    });
}
