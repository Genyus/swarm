import path from 'node:path';
import { getSwarmVersion } from '../../common';
import { logger } from '../../logger';
import {
  configManager,
  createErrorContext,
  ErrorFactory,
  MCPManager,
  ServerConfig,
} from '../server';

export class ServerManager {
  private server: MCPManager | null = null;
  private isRunning = false;
  private pid: number | null = null;

  async start(): Promise<void> {
    if (this.isRunning) {
      throw ErrorFactory.internal(
        'start server',
        undefined,
        createErrorContext('ServerManager', 'start')
      );
    }

    try {
      const projectRoot = this.resolveProjectRoot();

      if (process.cwd() !== projectRoot) {
        process.chdir(projectRoot);
      }

      await configManager.loadConfig();

      const config: ServerConfig = {
        name: 'Swarm MCP Server',
        version: getSwarmVersion(),
        tools: [],
        capabilities: {
          tools: { listChanged: true },
          resources: { subscribe: false, listChanged: false },
        },
        instructions: 'Swarm MCP Server for Wasp application code generation',
      };

      this.server = new MCPManager(config);

      await this.server.loadConfiguration();
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
      throw ErrorFactory.internal(
        'start server',
        new Error(errorMessage),
        createErrorContext('ServerManager', 'start')
      );
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
      throw ErrorFactory.internal(
        'stop server',
        new Error(errorMessage),
        createErrorContext('ServerManager', 'stop')
      );
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

  private resolveProjectRoot(): string {
    const binPath = process.argv[1];

    if (binPath) {
      const resolvedPath = path.resolve(binPath);
      const segments = resolvedPath.split(path.sep);
      const nodeModulesIndex = segments.lastIndexOf('node_modules');

      if (nodeModulesIndex > 0) {
        const rootSegments = segments.slice(0, nodeModulesIndex);
        const candidate = rootSegments.join(path.sep);

        if (candidate) {
          return candidate;
        }
        return path.sep;
      }
    }

    return process.cwd();
  }
}
