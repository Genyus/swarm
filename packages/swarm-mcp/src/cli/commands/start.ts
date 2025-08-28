import { Command } from 'commander';
import { ServerManager } from '../server-manager.js';

interface StartOptions {
  port: string;
  stdio?: boolean;
}

export function createStartCommand(serverManager: ServerManager): Command {
  return new Command('start')
    .description('Start the MCP server')
    .option(
      '-p, --port <number>',
      'Port to run the server on (default: 3000)',
      '3000'
    )
    .option('--stdio', 'Run in stdio mode for MCP client integration')
    .action(async (options: StartOptions) => {
      try {
        const port = parseInt(options.port, 10);

        if (isNaN(port) || port < 1 || port > 65535) {
          console.error(
            'Error: Port must be a valid number between 1 and 65535'
          );
          process.exit(1);
        }

        if (options.stdio) {
          console.log('Starting Swarm MCP server in stdio mode...');
          await serverManager.start({ stdio: true });
          console.log('✅ Server started successfully in stdio mode');
        } else {
          console.log(`Starting Swarm MCP server on port ${port}...`);
          await serverManager.start({ port });
          console.log(`✅ Server started successfully on port ${port}`);
          console.log(`🌐 Access the server at: http://localhost:${port}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to start server: ${errorMessage}`);
        process.exit(1);
      }
    });
}
