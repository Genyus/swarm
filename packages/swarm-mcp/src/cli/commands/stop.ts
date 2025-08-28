import { Command } from 'commander';
import { ServerManager } from '../server-manager.js';

interface StopOptions {
  force?: boolean;
}

export function createStopCommand(serverManager: ServerManager): Command {
  return new Command('stop')
    .description('Stop the MCP server')
    .option('--force', 'Force stop the server (may cause data loss)')
    .action(async (options: StopOptions) => {
      try {
        if (!serverManager.isServerRunning()) {
          console.log('ℹ️  Server is not currently running');
          return;
        }

        console.log('Stopping Swarm MCP server...');

        if (options.force) {
          console.log('⚠️  Force stopping server...');
        }

        await serverManager.stop();
        console.log('✅ Server stopped successfully');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to stop server: ${errorMessage}`);

        if (options.force) {
          console.log('💀 Force killing server process...');
          process.exit(1);
        } else {
          process.exit(1);
        }
      }
    });
}
