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
import { configureLogger, LogFormat, logger, LogLevel } from '../../logger';
import { configManager } from './configuration-manager';
import {
  createErrorContext,
  ErrorFactory,
  MCPErrorCode,
  MCPProtocolError,
} from './errors';
import { ToolManager } from './tool-manager';
import { ServerConfig, ServerInfo, ServerState } from './types';

export class MCPManager {
  private mcpServer: MCPServer;
  private config: ServerConfig;
  private state: ServerState;
  private transport?: MCPTransport;
  private toolManager: ToolManager;

  constructor(config: ServerConfig) {
    // Ensure logging goes to stderr to avoid corrupting MCP stdio transport.
    configureLogger({
      stream: 'stderr',
      level: (process.env['SWARM_MCP_LOG_LEVEL'] || 'info') as LogLevel,
      format: (process.env['SWARM_MCP_LOG_FORMAT'] || 'text') as LogFormat,
    });
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
    // Note: registerTools is now async and will be called during start()
  }

  async loadConfiguration(): Promise<void> {
    try {
      await configManager.loadConfig();

      logger.info('Configuration loaded and applied', {
        configPath: configManager.getConfigPath(),
      });
    } catch (error) {
      logger.warn('Failed to load configuration, using defaults', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private setupEventHandlers(): void {
    this.mcpServer.oninitialized = (): void => {
      logger.info('MCP client initialized');
    };

    this.mcpServer.onclose = (): void => {
      logger.info('MCP connection closed');
      this.state.isRunning = false;
      this.state.transport = undefined;
    };

    this.mcpServer.onerror = (error: Error): void => {
      logger.error('MCP server error', { error: error.message });
    };
  }

  private async registerTools(): Promise<void> {
    logger.info('Tool registration framework initialized');
    await this.toolManager.initialize();

    const tools = await this.toolManager.getTools();
    const toolDefinitions = this.toolManager.getToolDefinitions();

    this.mcpServer.setRequestHandler(ListResourcesRequestSchema, () => ({
      resources: [],
    }));

    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name in tools) {
        try {
          const result = await (tools as any)[name](args);

          // Check if the result indicates failure
          if (
            result &&
            typeof result === 'object' &&
            'success' in result &&
            result.success === false
          ) {
            const errorMessage =
              result.error || result.output || 'Tool execution failed';
            throw new MCPProtocolError(
              MCPErrorCode.InternalError,
              errorMessage
            );
          }

          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: unknown) {
          throw new MCPProtocolError(
            MCPErrorCode.InternalError,
            `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      throw new MCPProtocolError(
        MCPErrorCode.MethodNotFound,
        `Unknown tool: ${name}`
      );
    });

    this.mcpServer.setRequestHandler(ListToolsRequestSchema, () => ({
      tools: Object.values(toolDefinitions),
    }));
  }

  async start(): Promise<void> {
    if (this.state.isRunning) {
      throw ErrorFactory.internal(
        'start server',
        undefined,
        createErrorContext('SwarmMCPServer', 'start')
      );
    }

    try {
      logger.info('Starting Swarm MCP Server', {
        name: this.config.name,
        version: this.config.version,
      });

      // Register tools before connecting
      await this.registerTools();

      this.transport = new StdioServerTransport();

      await this.mcpServer.connect(this.transport);

      this.state.isRunning = true;
      this.state.sessionId = randomUUID();

      logger.info('Swarm MCP Server started successfully', {
        sessionId: this.state.sessionId,
      });
    } catch (error) {
      logger.error('Failed to start MCP server', {
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
      logger.info('Stopping Swarm MCP Server');

      if (this.transport) {
        await this.transport.close();
      }

      await this.mcpServer.close();

      this.state.isRunning = false;
      this.state.transport = undefined;
      this.state.sessionId = undefined;

      logger.info('Swarm MCP Server stopped successfully');
    } catch (error) {
      logger.error('Error stopping MCP server', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  getStatus(): ServerState {
    return { ...this.state };
  }

  getInfo(): ServerInfo {
    return {
      name: this.config.name,
      version: this.config.version,
      capabilities: this.config.capabilities,
      instructions: this.config.instructions,
      status: this.getStatus(),
    };
  }
}
