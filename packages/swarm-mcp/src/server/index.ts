import { realLogger as logger } from '@ingenyus/swarm-cli/dist/utils/logger.js';
import {
  Server as MCPServer,
  ServerOptions,
} from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Transport as MCPTransport } from '@modelcontextprotocol/sdk/shared/transport.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'crypto';
import { tools } from './tools/index.js';
import {
  MCPErrorCode,
  MCPProtocolError,
  ServerConfig,
  ServerState,
  Tool,
} from './types/mcp.js';
import { configManager } from './utils/config.js';
import { ErrorFactory, createErrorContext } from './utils/errors.js';

export class SwarmMCPServer {
  private mcpServer: MCPServer;
  private config: ServerConfig;
  private state: ServerState;
  private transport?: MCPTransport;

  constructor(config: ServerConfig) {
    this.config = config;
    this.state = {
      isRunning: false,
    };

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
    this.registerTools();
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

  private registerTools(): void {
    logger.info('Tool registration framework initialized');
    logger.debug(
      'Available tools: filesystem operations, Swarm CLI generation tools'
    );

    this.mcpServer.setRequestHandler(ListResourcesRequestSchema, () => ({
      resources: [],
    }));

    this.mcpServer.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      if (name in tools) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          const result = await (tools as any)[name](args);
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
      tools: [
        {
          name: 'readFile',
          description: 'Read file contents with security validation',
          inputSchema: {
            type: 'object',
            properties: {
              uri: { type: 'string', description: 'File URI to read' },
            },
            required: ['uri'],
          },
        },
        {
          name: 'writeFile',
          description: 'Write file contents with backup and rollback support',
          inputSchema: {
            type: 'object',
            properties: {
              uri: { type: 'string', description: 'File URI to write' },
              content: { type: 'string', description: 'Content to write' },
              backup: {
                type: 'boolean',
                description: 'Create backup before writing',
              },
              dryRun: {
                type: 'boolean',
                description: 'Simulate the operation',
              },
              rollbackToken: {
                type: 'string',
                description: 'Token for rollback capability',
              },
            },
            required: ['uri', 'content'],
          },
        },
        {
          name: 'listDirectory',
          description: 'List directory contents with filtering and pagination',
          inputSchema: {
            type: 'object',
            properties: {
              uri: { type: 'string', description: 'Directory URI to list' },
              recursive: { type: 'boolean', description: 'Recursive listing' },
              maxDepth: {
                type: 'number',
                description: 'Maximum recursion depth',
              },
              filterName: {
                type: 'string',
                description: 'Name filter pattern',
              },
              filterExtension: {
                type: 'string',
                description: 'Extension filter',
              },
              sortBy: {
                type: 'string',
                enum: ['name', 'size', 'type', 'modified'],
                description: 'Sort criteria',
              },
              sortOrder: {
                type: 'string',
                enum: ['asc', 'desc'],
                description: 'Sort order',
              },
              offset: { type: 'number', description: 'Pagination offset' },
              limit: { type: 'number', description: 'Pagination limit' },
            },
            required: ['uri'],
          },
        },
        {
          name: 'deleteFile',
          description: 'Delete file with backup and rollback support',
          inputSchema: {
            type: 'object',
            properties: {
              uri: { type: 'string', description: 'File URI to delete' },
              backup: {
                type: 'boolean',
                description: 'Create backup before deletion',
              },
              dryRun: {
                type: 'boolean',
                description: 'Simulate the operation',
              },
              rollbackToken: {
                type: 'string',
                description: 'Token for rollback capability',
              },
            },
            required: ['uri'],
          },
        },
        {
          name: 'rollback',
          description: 'Rollback file operations using a rollback token',
          inputSchema: {
            type: 'object',
            properties: {
              rollbackToken: { type: 'string', description: 'Rollback token' },
            },
            required: ['rollbackToken'],
          },
        },
        {
          name: 'swarm_generate_api',
          description: 'Generate API endpoints for Wasp projects',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'API name' },
              method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'DELETE', 'ALL'],
                description: 'HTTP method',
              },
              route: { type: 'string', description: 'API route path' },
              entities: {
                type: 'array',
                items: { type: 'string' },
                description: 'Related entities',
              },
              auth: { type: 'boolean', description: 'Require authentication' },
              force: {
                type: 'boolean',
                description: 'Force overwrite existing files',
              },
            },
            required: ['name', 'method', 'route'],
          },
        },
        {
          name: 'swarm_generate_feature',
          description: 'Generate feature modules for Wasp projects',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Feature name' },
              dataType: { type: 'string', description: 'Data type/model name' },
              components: {
                type: 'array',
                items: { type: 'string' },
                description: 'Component names to generate',
              },
              withTests: {
                type: 'boolean',
                description: 'Generate test files',
              },
              force: {
                type: 'boolean',
                description: 'Force overwrite existing files',
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'swarm_generate_crud',
          description: 'Generate CRUD operations for Wasp projects',
          inputSchema: {
            type: 'object',
            properties: {
              dataType: { type: 'string', description: 'Data type/model name' },
              public: {
                type: 'array',
                items: { type: 'string' },
                description: 'Public operations',
              },
              override: {
                type: 'array',
                items: { type: 'string' },
                description: 'Operations to override',
              },
              exclude: {
                type: 'array',
                items: { type: 'string' },
                description: 'Operations to exclude',
              },
              force: {
                type: 'boolean',
                description: 'Force overwrite existing files',
              },
            },
            required: ['dataType'],
          },
        },
        {
          name: 'swarm_generate_job',
          description: 'Generate background jobs for Wasp projects',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Job name' },
              schedule: {
                type: 'string',
                description: 'Cron schedule expression',
              },
              scheduleArgs: {
                type: 'string',
                description: 'Schedule arguments JSON',
              },
              entities: {
                type: 'array',
                items: { type: 'string' },
                description: 'Related entities',
              },
              force: {
                type: 'boolean',
                description: 'Force overwrite existing files',
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'swarm_generate_operation',
          description: 'Generate queries or actions for Wasp projects',
          inputSchema: {
            type: 'object',
            properties: {
              feature: { type: 'string', description: 'Feature name' },
              operation: {
                type: 'string',
                enum: ['create', 'update', 'delete', 'get', 'getAll'],
                description: 'Operation type',
              },
              dataType: { type: 'string', description: 'Data type/model name' },
              entities: {
                type: 'array',
                items: { type: 'string' },
                description: 'Related entities',
              },
              auth: { type: 'boolean', description: 'Require authentication' },
              force: {
                type: 'boolean',
                description: 'Force overwrite existing files',
              },
            },
            required: ['feature', 'operation', 'dataType'],
          },
        },
        {
          name: 'swarm_generate_route',
          description: 'Generate routes for Wasp projects',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Route name' },
              path: { type: 'string', description: 'Route path' },
              auth: { type: 'boolean', description: 'Require authentication' },
              force: {
                type: 'boolean',
                description: 'Force overwrite existing files',
              },
            },
            required: ['name', 'path'],
          },
        },
        {
          name: 'swarm_generate_apinamespace',
          description: 'Generate API namespaces for Wasp projects',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'API namespace name' },
              path: { type: 'string', description: 'API namespace path' },
              force: {
                type: 'boolean',
                description: 'Force overwrite existing files',
              },
            },
            required: ['name', 'path'],
          },
        },
        {
          name: 'swarm_analyze_project',
          description: 'Analyze Wasp project structure and dependencies',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: {
                type: 'string',
                description: 'Project directory path',
              },
              includeDependencies: {
                type: 'boolean',
                description: 'Include dependency analysis',
              },
              includeStructure: {
                type: 'boolean',
                description: 'Include structure analysis',
              },
              deep: { type: 'boolean', description: 'Perform deep analysis' },
            },
          },
        },
        {
          name: 'swarm_validate_config',
          description: 'Validate Wasp project configuration',
          inputSchema: {
            type: 'object',
            properties: {
              configPath: {
                type: 'string',
                description: 'Configuration file path',
              },
              strict: {
                type: 'boolean',
                description: 'Strict validation mode',
              },
              checkDependencies: {
                type: 'boolean',
                description: 'Check dependencies',
              },
            },
          },
        },
      ],
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

  getInfo(): unknown {
    return {
      name: this.config.name,
      version: this.config.version,
      capabilities: this.config.capabilities,
      instructions: this.config.instructions,
      status: this.getStatus(),
    };
  }
}

export { MCPErrorCode, MCPProtocolError, ServerConfig, ServerState, Tool };
export default SwarmMCPServer;
