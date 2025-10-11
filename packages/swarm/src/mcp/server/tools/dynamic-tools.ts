import { PluginManager } from '../../../plugin/plugin-manager';
import { MCPToolDefinition, MCPToolHandler, ToolFactory } from './tool-factory';

/**
 * Dynamic MCP tools that are built from enabled generators
 */
class DynamicMCPTools {
  private initialized = false;
  private pluginManager: PluginManager;
  private toolDefinitions: Record<string, MCPToolDefinition> = {};
  private toolHandlers: Record<string, MCPToolHandler> = {};

  constructor() {
    this.pluginManager = new PluginManager();
  }

  /**
   * Initialize the dynamic tools by loading plugins and creating tools from generators
   */
  async initialize(configPath?: string): Promise<void> {
    if (this.initialized) return;

    try {
      await this.pluginManager.initialize(configPath);

      const generators = this.pluginManager.getEnabledGenerators();

      this.toolDefinitions = {};
      this.toolHandlers = {};

      for (const generator of generators) {
        try {
          const tool = ToolFactory.createTool(generator);

          this.toolDefinitions[generator.name] = tool.definition;
          this.toolHandlers[generator.name] = tool.handler;
        } catch (error) {
          console.warn(
            `Failed to create MCP tool for generator '${generator.name}':`,
            error
          );
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize dynamic MCP tools:', error);

      throw error;
    }
  }

  /**
   * Get tool definitions for MCP server registration
   */
  getToolDefinitions(): Record<string, MCPToolDefinition> {
    if (!this.initialized) {
      throw new Error(
        'DynamicMCPTools not initialized. Call initialize() first.'
      );
    }

    return this.toolDefinitions;
  }

  /**
   * Get tool handlers for MCP server execution
   */
  getToolHandlers(): Record<string, MCPToolHandler> {
    if (!this.initialized) {
      throw new Error(
        'DynamicMCPTools not initialized. Call initialize() first.'
      );
    }

    return this.toolHandlers;
  }

  /**
   * Get all available tools as a single object for MCP server
   */
  async getTools(
    configPath?: string
  ): Promise<Record<string, (args: any) => Promise<any>>> {
    await this.initialize(configPath);
    return this.getToolHandlers();
  }

  /**
   * Refresh tools by reloading plugins and rebuilding
   */
  async refresh(): Promise<void> {
    this.initialized = false;
    this.pluginManager = new PluginManager();
    await this.initialize();
  }

  /**
   * Get the plugin manager instance
   * @returns The plugin manager
   */
  getPluginManager(): PluginManager {
    return this.pluginManager;
  }
}

// Create singleton instance
const dynamicMCPTools = new DynamicMCPTools();
