import {
  configureLogger,
  LogFormat,
  realLogger as logger,
  LogLevel,
} from '../../../utils/logger';
import { Command } from 'commander';
import { ServerManager } from '../server-manager.js';

export function createStartCommand(serverManager: ServerManager): Command {
  configureLogger({
    stream: 'stderr',
    level: (process.env['SWARM_MCP_LOG_LEVEL'] || 'info') as LogLevel,
    format: (process.env['SWARM_MCP_LOG_FORMAT'] || 'text') as LogFormat,
  });
  return new Command('start')
    .description('Start the MCP server in stdio mode')
    .action(async () => {
      try {
        logger.info('Starting Swarm MCP server in stdio mode...');
        await serverManager.start();
        logger.info('✅ Server started successfully in stdio mode');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`❌ Failed to start server: ${errorMessage}`);
        process.exit(1);
      }
    });
}
