import { Server as MCPServer, ServerOptions } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { Transport as MCPTransport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { randomUUID } from 'crypto';

import {
  MCPErrorCode,
  MCPProtocolError,
  ServerConfig,
  ServerState,
  Tool,
  TransportOptions,
} from './types/mcp.js';

import { logger } from './utils/logger.js';

/**
 * Swarm MCP Server implementation
 * Provides MCP protocol compliance with transport support for stdio, HTTP, and Unix sockets
 */
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
      },
      instructions: config.instructions || 'Swarm MCP Server for Wasp application code generation',
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

  /**
   * Register all available tools with the MCP server
   */
  private registerTools(): void {
    // Note: Request handlers are commented out due to type compatibility issues with the MCP SDK
    // The SDK expects specific Zod schema types, but we need string method names for our tools
    // TODO: Investigate proper MCP SDK tool registration approach
    
    logger.info('Tool registration framework initialized');
    logger.debug('Available tools: filesystem operations, Swarm CLI generation tools');
    
    // Tools will be registered once we resolve the type compatibility issues:
    // - filesystem/read_file
    // - filesystem/write_file  
    // - filesystem/list_dir
    // - filesystem/delete_file
    // - swarm/generate_api
    // - swarm/generate_feature
  }

  /**
   * Start the MCP server with the configured transport
   */
  async start(): Promise<void> {
    if (this.state.isRunning) {
      throw new Error('Server is already running');
    }

    try {
      logger.info('Starting Swarm MCP Server', {
        name: this.config.name,
        version: this.config.version,
        transport: Object.keys(this.config.transport)[0],
      });

      // Create transport based on configuration
      this.transport = this.createTransport();
      
      // Connect the transport to the MCP server
      await this.mcpServer.connect(this.transport);
      
      this.state.isRunning = true;
      this.state.sessionId = randomUUID();
      
      logger.info('Swarm MCP Server started successfully', {
        sessionId: this.state.sessionId,
      });
    } catch (error) {
      logger.error('Failed to start MCP server', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Stop the MCP server
   */
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
      logger.error('Error stopping MCP server', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get the current server status
   */
  getStatus(): ServerState {
    return { ...this.state };
  }

  /**
   * Create transport based on configuration
   */
  private createTransport(): MCPTransport {
    if (this.config.transport.stdio) {
      logger.debug('Creating stdio transport');
      return new StdioServerTransport();
    }

    if (this.config.transport.http) {
      logger.debug('Creating HTTP transport');
      const { host = 'localhost', allowedOrigins = ['*'] } = this.config.transport.http;
      
      return new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableDnsRebindingProtection: false,
        allowedHosts: [host],
        allowedOrigins,
      });
    }

    if (this.config.transport.unixSocket) {
      logger.debug('Creating Unix socket transport');
      // TODO: Implement Unix socket transport
      throw new Error('Unix socket transport not yet implemented');
    }

    // Default to stdio transport
    logger.debug('Creating default stdio transport');
    return new StdioServerTransport();
  }

  /**
   * Get server information
   */
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

// Export the server class and related types
export { MCPErrorCode, MCPProtocolError, ServerConfig, ServerState, Tool, TransportOptions };
export default SwarmMCPServer;
