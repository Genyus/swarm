import {
  ServerConfig,
  SwarmMCPServer,
  TransportOptions,
} from '../server/index.js';
import { logger } from '../server/utils/logger.js';

export class ServerManager {
  private server: SwarmMCPServer | null = null;
  private isRunning = false;
  private pid: number | null = null;

  async start(options: { port?: number; stdio?: boolean } = {}): Promise<void> {
    if (this.isRunning) {
      throw new Error('Server is already running');
    }

    try {
      let transportConfig: TransportOptions;

      if (options.stdio) {
        transportConfig = { stdio: {} };
      } else {
        const port = options.port || 3000;
        transportConfig = {
          http: {
            host: 'localhost',
            port,
            allowedOrigins: ['*'],
          },
        };
      }

      const config: ServerConfig = {
        name: 'Swarm MCP Server',
        version: '0.1.0',
        transport: transportConfig,
        tools: [], // Tools are registered internally by the server
        capabilities: {
          tools: { listChanged: true },
          resources: { subscribe: false, listChanged: false },
        },
        instructions: 'Swarm MCP Server for Wasp application code generation',
      };

      this.server = new SwarmMCPServer(config);
      await this.server.start();

      this.isRunning = true;
      this.pid = process.pid;

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        void this.stop();
      });
      process.on('SIGTERM', () => {
        void this.stop();
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Failed to start server: ${errorMessage}`);
      throw new Error(`Failed to start server: ${errorMessage}`);
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning || !this.server) {
      return;
    }

    try {
      await this.server.stop();
      this.isRunning = false;
      this.pid = null;
      this.server = null;
      logger.info('MCP server stopped');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Failed to stop server: ${errorMessage}`);
      throw new Error(`Failed to stop server: ${errorMessage}`);
    }
  }

  getStatus(): { isRunning: boolean; pid: number | null; uptime?: number } {
    if (!this.isRunning || !this.server) {
      return { isRunning: false, pid: null };
    }

    return {
      isRunning: true,
      pid: this.pid,
      uptime: process.uptime(),
    };
  }

  isServerRunning(): boolean {
    return this.isRunning;
  }
}
