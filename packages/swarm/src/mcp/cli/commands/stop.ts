import { Command } from 'commander';
import { configureLogger, LogFormat, logger, LogLevel } from '../../../common';
import { ServerManager } from '../server-manager.js';

interface StopOptions {
  force?: boolean;
}

export function createStopCommand(serverManager: ServerManager): Command {
  configureLogger({
    stream: 'stderr',
    level: (process.env['SWARM_MCP_LOG_LEVEL'] || 'info') as LogLevel,
    format: (process.env['SWARM_MCP_LOG_FORMAT'] || 'text') as LogFormat,
  });
  return new Command('stop')
    .description('Stop the MCP server')
    .option('--force', 'Force stop the server (may cause data loss)')
    .action(async (options: StopOptions) => {
      try {
        if (!serverManager.isServerRunning()) {
          logger.info('ℹ️  Server is not currently running');
          return;
        }

        logger.info('Stopping Swarm MCP server...');

        if (options.force) {
          logger.info('⚠️  Force stopping server...');
        }

        await serverManager.stop();
        logger.info('✅ Server stopped successfully');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`❌ Failed to stop server: ${errorMessage}`);

        if (options.force) {
          logger.info('💀 Force killing server process...');
          process.exit(1);
        } else {
          process.exit(1);
        }
      }
    });
}
