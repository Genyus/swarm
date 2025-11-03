import { Command } from 'commander';
import { configureLogger, LogFormat, logger, LogLevel } from '../../../logger';
import { ServerManager } from '../server-manager';

export function createStartCommand(serverManager: ServerManager): Command {
  configureLogger({
    stream: 'stderr',
    level: (process.env['SWARM_MCP_LOG_LEVEL'] || 'info') as LogLevel,
    format: (process.env['SWARM_MCP_LOG_FORMAT'] || 'text') as LogFormat,
  });

  return new Command('start')
    .description('Start the MCP server in stdio mode')
    .option('-c, --config <path>', 'Path to configuration file')
    .action(async (options: { config?: string }) => {
      try {
        logger.info('Starting Swarm MCP server in stdio mode...');
        await serverManager.start(options.config);
        logger.info('✅ Server started successfully in stdio mode');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`❌ Failed to start server: ${errorMessage}`);
        process.exit(1);
      }
    });
}
