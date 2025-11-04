import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { getSwarmVersion } from '../../common';
import { logger } from '../../logger';
import {
  configManager,
  ConfigurationManager,
  createErrorContext,
  ErrorFactory,
  MCPManager,
  ServerConfig,
} from '../server';

export class ServerManager {
  private server: MCPManager | null = null;
  private isRunning = false;
  private pid: number | null = null;

  async start(configPath?: string): Promise<void> {
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

      // ConfigurationManager is for MCP server logging config (.mcp/config.json)
      // It uses its own search logic, not the --config flag
      // The --config flag is for Swarm plugin config (swarm.config.json)
      const manager = configManager;
      await manager.loadConfig();

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

      // Pass the configPath to MCPManager so it can be used for SwarmConfigManager
      // (ConfigurationManager is for MCP server logging config, separate from Swarm plugin config)
      const expandedConfigPath = configPath
        ? configPath.startsWith('~')
          ? path.join(homedir(), configPath.slice(1))
          : path.resolve(configPath)
        : undefined;

      this.server = new MCPManager(config, manager, expandedConfigPath);
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
    // Strategy: Try process.cwd() first, then fall back to binary path resolution
    // This handles all scenarios:
    // 1. Local direct path: cwd() is project root
    // 2. External direct path: cwd() is target project root
    // 3. Local npx: cwd() is project root (fixed)
    // 4. Remote npx: cwd() is where command was invoked, then fallback to binary path

    const cwd = process.cwd();

    // Check if cwd() looks like a valid project directory
    const hasSwarmConfig = existsSync(path.join(cwd, 'swarm.config.json'));
    const hasPackageJson = existsSync(path.join(cwd, 'package.json'));

    if (hasSwarmConfig || hasPackageJson) {
      return cwd;
    }

    // Fallback: Try to infer project root from binary location
    // This helps when:
    // - Binary is installed locally in project/node_modules (scenario 1)
    // - Remote npx but binary happens to be in a project's node_modules
    const binPath = process.argv[1];

    if (binPath) {
      const resolvedPath = path.resolve(binPath);
      const segments = resolvedPath.split(path.sep);
      const nodeModulesIndex = segments.lastIndexOf('node_modules');

      if (nodeModulesIndex > 0) {
        const rootSegments = segments.slice(0, nodeModulesIndex);
        const candidate = rootSegments.join(path.sep);

        // Verify the candidate actually looks like a project root
        if (candidate) {
          const candidateHasConfig = existsSync(
            path.join(candidate, 'swarm.config.json')
          );
          const candidateHasPackage = existsSync(
            path.join(candidate, 'package.json')
          );

          if (candidateHasConfig || candidateHasPackage) {
            return candidate;
          }
        }
      }
    }

    // Final fallback: use cwd() (will be used by findProjectRoot() to search upward)
    return cwd;
  }
}
