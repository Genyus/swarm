import { Command } from 'commander';
import { ServerManager } from '../server-manager.js';

interface StatusOptions {
  json?: boolean;
}

export function createStatusCommand(serverManager: ServerManager): Command {
  return new Command('status')
    .description('Check server status')
    .option('--json', 'Output status in JSON format')
    .action((options: StatusOptions) => {
      try {
        const status = serverManager.getStatus();

        if (options.json) {
          console.log(JSON.stringify(status, null, 2));
          return;
        }

        console.log('🔄 Swarm MCP Server Status');
        console.log('========================');

        if (status.isRunning) {
          console.log(`✅ Status: Running`);
          console.log(`🆔 PID: ${status.pid}`);
          if (status.uptime) {
            const hours = Math.floor(status.uptime / 3600);
            const minutes = Math.floor((status.uptime % 3600) / 60);
            const seconds = Math.floor(status.uptime % 60);
            console.log(`⏱️  Uptime: ${hours}h ${minutes}m ${seconds}s`);
          }
        } else {
          console.log(`❌ Status: Not running`);
        }

        console.log('========================');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to get server status: ${errorMessage}`);
        process.exit(1);
      }
    });
}
