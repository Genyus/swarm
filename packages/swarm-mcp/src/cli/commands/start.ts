import { Command } from 'commander';
import { ServerManager } from '../server-manager.js';

export function createStartCommand(serverManager: ServerManager): Command {
  return new Command('start')
    .description('Start the MCP server in stdio mode')
    .action(async () => {
      try {
        console.log('Starting Swarm MCP server in stdio mode...');
        await serverManager.start();
        console.log('✅ Server started successfully in stdio mode');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to start server: ${errorMessage}`);
        process.exit(1);
      }
    });
}
