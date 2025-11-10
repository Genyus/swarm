import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { getCLILogger } from '../../cli/cli-logger';
import { getSwarmVersion } from '../../common';
import { getConfigManager } from '../../config';
import {
  createErrorContext,
  InternalError,
  MCPManager,
  MCPServerConfig,
} from '../server';

export class ServerManager {
  private server: MCPManager | null = null;
  private isRunning = false;
  private pid: number | null = null;
  private logger = getCLILogger();

  async start(configPath?: string): Promise<void> {
    if (this.isRunning) {
      throw new InternalError(
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

      const swarmConfigManager = getConfigManager();
      const expandedConfigPath = configPath
        ? configPath.startsWith('~')
          ? path.join(homedir(), configPath.slice(1))
          : path.resolve(configPath)
        : undefined;

      await swarmConfigManager.loadConfig(expandedConfigPath, projectRoot);

      const config: MCPServerConfig = {
        name: 'Swarm MCP Server',
        version: getSwarmVersion(),
        tools: [],
        capabilities: {
          tools: { listChanged: true },
          resources: { subscribe: false, listChanged: false },
        },
        instructions: 'Swarm MCP Server for Wasp application code generation',
      };

      this.server = new MCPManager(config, expandedConfigPath);
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
      this.logger.error(`Failed to start server: ${errorMessage}`);
      throw new InternalError(
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to stop server: ${errorMessage}`);
      throw new InternalError(
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
