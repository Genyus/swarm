import {
  Server as MCPServer,
  ServerOptions,
} from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Transport as MCPTransport } from '@modelcontextprotocol/sdk/shared/transport.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'crypto';
import { getCLILogger } from '../../cli/cli-logger';
import { realFileSystem } from '../../common';
import { getMCPLogger } from '../mcp-logger';
import { createErrorContext, InternalError } from './errors';
import { ToolManager } from './tool-manager';
import { MCPServerConfig, MCPServerInfo, MCPServerState } from './types';

export class MCPManager {
  private mcpServer: MCPServer;
  private config: MCPServerConfig;
  private state: MCPServerState;
  private transport?: MCPTransport;
  private toolManager: ToolManager;
  private swarmConfigPath?: string;
  private cliLogger = getCLILogger();
  private mcpLogger = getMCPLogger();

  constructor(config: MCPServerConfig, swarmConfigPath?: string) {
    this.swarmConfigPath = swarmConfigPath;
    this.config = config;
    this.state = {
      isRunning: false,
    };
    this.toolManager = new ToolManager();

    const serverOptions: ServerOptions = {
      capabilities: {
        tools: {
          listChanged: true,
        },
        resources: {
          subscribe: false,
          listChanged: false,
        },
        logging: {},
      },
      instructions:
        config.instructions ||
        'Swarm MCP Server for Wasp application code generation',
    };

    this.mcpServer = new MCPServer(
      {
        name: config.name,
        version: config.version,
      },
      serverOptions
    );

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.mcpServer.onclose = (): void => {
      this.state.isRunning = false;
      this.state.transport = undefined;
      this.toolManager.setMCPServer(null);
    };
    this.mcpServer.onerror = (error: Error): void => {
      this.cliLogger.error('MCP server error', { error: error.message });
    };
  }

  private async registerTools(): Promise<void> {
    await this.toolManager.initialize(this.swarmConfigPath, {
      fileSystem: realFileSystem,
      logger: this.mcpLogger,
    });

    const tools = await this.toolManager.getTools();
    const toolDefinitions = this.toolManager.getToolDefinitions();

    this.mcpServer.setRequestHandler(ListResourcesRequestSchema, () => ({
      resources: [],
    }));
    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const handler = tools[name];

      if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
      }

      return await handler(args);
    });
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, () => ({
      tools: Object.values(toolDefinitions),
    }));
  }

  async start(): Promise<void> {
    if (this.state.isRunning) {
      throw new InternalError(
        'start server',
        undefined,
        createErrorContext('SwarmMCPServer', 'start')
      );
    }

    try {
      this.cliLogger.info('Starting Swarm MCP Server...');
      // Register tools before connecting
      await this.registerTools();
      this.transport = new StdioServerTransport();
      await this.mcpServer.connect(this.transport);
      this.toolManager.setMCPServer(this.mcpServer);
      this.state.isRunning = true;
      this.state.sessionId = randomUUID();
      this.cliLogger.info(
        `Swarm MCP Server (v${this.config.version}) started successfully.`
      );
    } catch (error) {
      this.cliLogger.error('Failed to start MCP server', {
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.state.isRunning) {
      return;
    }

    try {
      this.cliLogger.info('Stopping Swarm MCP Server...');

      if (this.transport) {
        await this.transport.close();
      }

      await this.mcpServer.close();

      this.state.isRunning = false;
      this.state.transport = undefined;
      this.state.sessionId = undefined;

      this.cliLogger.info('Swarm MCP Server stopped successfully');
    } catch (error) {
      this.cliLogger.error('Error stopping MCP server', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  getStatus(): MCPServerState {
    return { ...this.state };
  }

  getInfo(): MCPServerInfo {
    return {
      name: this.config.name,
      version: this.config.version,
      capabilities: this.config.capabilities,
      instructions: this.config.instructions,
      status: this.getStatus(),
    };
  }
}
