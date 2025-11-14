import type { Server as MCPServer } from '@modelcontextprotocol/sdk/server';
import {
  Generator,
  GeneratorProvider,
  GeneratorServices,
  getGeneratorServices,
} from '../../generator';
import { PluginInterfaceManager } from '../../plugin';
import {
  SchemaFieldMetadata,
  SchemaManager,
  StandardSchemaV1,
  standardValidate,
} from '../../schema';
import { getMCPLogger } from '../mcp-logger';

/**
 * MCP Tool definition interface
 */
interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * MCP Tool handler function type
 */
type MCPToolHandler = (args: any) => Promise<any>;

/**
 * MCP Tool interface combining definition and handler
 */
interface MCPTool {
  definition: MCPToolDefinition;
  handler: MCPToolHandler;
}

/**
 * Manages MCP tools created from generators
 * Provides a unified interface for tool registration and management
 */
export class ToolManager extends PluginInterfaceManager<MCPTool> {
  private mcpServer: MCPServer | null = null;

  /**
   * Set the MCP server instance for creating MCPLogger instances
   */
  setMCPServer(mcpServer: MCPServer | null): void {
    this.mcpServer = mcpServer;
  }

  /**
   * Create an MCP tool from a generator provider
   */
  protected async createInterfaceFromProvider(
    provider: GeneratorProvider
  ): Promise<MCPTool> {
    return this.createTool(provider);
  }

  /**
   * Create an MCP tool definition from a generator's schema
   */
  private createToolDefinition(generator: Generator): MCPToolDefinition {
    const schema = generator.schema;
    const shape = SchemaManager.getShape(schema);

    if (!shape) {
      throw new Error(`Invalid schema for generator '${generator.name}'`);
    }

    const properties: Record<string, any> = {};
    const required: string[] = [];

    Object.entries(shape).forEach(([fieldName, fieldSchema]) => {
      const metadata = SchemaManager.getCommandMetadata(fieldSchema);
      const isRequired = SchemaManager.isFieldRequired(fieldSchema);

      if (isRequired) {
        required.push(fieldName);
      }

      properties[fieldName] = this.convertFieldToJSONSchema(
        fieldSchema,
        metadata
      );
    });

    return {
      name: `generate-${generator.name}`,
      description: generator.description,
      inputSchema: {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
      },
    };
  }

  /**
   * Create services for generator instantiation
   * Consolidated helper to avoid duplication
   */
  private createGeneratorServices(): GeneratorServices {
    const logger = getMCPLogger(this.mcpServer, 'error');

    return getGeneratorServices('mcp', logger);
  }

  /**
   * Create an MCP tool handler from a generator provider
   * Returns SDK-compatible CallToolResult format
   */
  private createToolHandler(provider: GeneratorProvider): MCPToolHandler {
    return async (args: any) => {
      const services = this.createGeneratorServices();
      const generator = await provider.create(services);
      const validatedArgs = await this.validateArgs(generator.schema, args);

      await generator.generate(validatedArgs);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                message: `Successfully executed generator '${generator.name}'`,
              },
              null,
              2
            ),
          },
        ],
      };
    };
  }

  /**
   * Create both tool definition and handler for a generator provider
   */
  private async createTool(provider: GeneratorProvider): Promise<MCPTool> {
    const services = this.createGeneratorServices();
    const generator = await provider.create(services);
    return {
      definition: this.createToolDefinition(generator),
      handler: this.createToolHandler(provider),
    };
  }

  /**
   * Convert schema metadata to JSON Schema format
   */
  private convertFieldToJSONSchema(
    fieldSchema: SchemaFieldMetadata,
    metadata?: SchemaFieldMetadata
  ): Record<string, any> {
    const typeName = SchemaManager.getFieldTypeName(fieldSchema);
    const description = metadata?.description || '';

    switch (typeName) {
      case 'string':
        return {
          type: 'string',
          description,
          ...(metadata?.examples && { examples: metadata.examples }),
          ...(metadata?.defaultValue !== undefined && {
            default: metadata.defaultValue,
          }),
        };

      case 'number':
        return {
          type: 'number',
          description,
          ...(metadata?.defaultValue !== undefined && {
            default: metadata.defaultValue,
          }),
        };

      case 'boolean':
        return {
          type: 'boolean',
          description,
          ...(metadata?.defaultValue !== undefined && {
            default: metadata.defaultValue,
          }),
        };

      case 'array': {
        const elementSchema = SchemaManager.getArrayElement(fieldSchema);

        return {
          type: 'array',
          items: elementSchema
            ? this.convertFieldToJSONSchema(elementSchema, elementSchema)
            : { type: 'string' },
          description,
          ...(metadata?.defaultValue !== undefined && {
            default: metadata.defaultValue,
          }),
        };
      }

      case 'enum': {
        const values = SchemaManager.getEnumValues(fieldSchema);

        return {
          type: 'string',
          enum: values || [],
          description,
          ...(metadata?.defaultValue !== undefined && {
            default: metadata.defaultValue,
          }),
        };
      }

      default:
        return {
          type: 'string',
          description,
          ...(metadata?.defaultValue !== undefined && {
            default: metadata.defaultValue,
          }),
        };
    }
  }

  private async validateArgs(schema: StandardSchemaV1, rawArgs: unknown) {
    const result = await standardValidate(schema, rawArgs as any);
    if (result.issues) {
      const message = result.issues
        .map((issue) => `${issue.message}${this.formatIssuePath(issue.path)}`)
        .join('\n');
      throw new Error(message);
    }
    return result.value;
  }

  private formatIssuePath(
    path?: ReadonlyArray<PropertyKey | { key: PropertyKey }>
  ): string {
    if (!path || path.length === 0) return '';
    const rendered = path
      .map((segment) =>
        typeof segment === 'object' && 'key' in segment
          ? String(segment.key)
          : String(segment)
      )
      .join('.');
    return rendered ? ` (${rendered})` : '';
  }

  /**
   * Get tool definitions for MCP server registration
   */
  getToolDefinitions(): Record<string, MCPToolDefinition> {
    if (!this.isInitialized()) {
      throw new Error('ToolManager not initialized. Call initialize() first.');
    }

    const tools = this.getInterfaces();
    const definitions: Record<string, MCPToolDefinition> = {};

    for (const tool of Object.values(tools)) {
      definitions[tool.definition.name] = tool.definition;
    }

    return definitions;
  }

  /**
   * Get tool handlers for MCP server execution
   */
  getToolHandlers(): Record<string, MCPToolHandler> {
    if (!this.isInitialized()) {
      throw new Error('ToolManager not initialized. Call initialize() first.');
    }

    const tools = this.getInterfaces();
    const handlers: Record<string, MCPToolHandler> = {};

    for (const tool of Object.values(tools)) {
      handlers[tool.definition.name] = tool.handler;
    }

    return handlers;
  }

  /**
   * Get all available tools as a single object for MCP server
   * This is a convenience method that combines definitions and handlers
   */
  async getTools(
    configPath?: string
  ): Promise<Record<string, (args: any) => Promise<any>>> {
    if (!this.isInitialized()) {
      await this.initialize(configPath);
    }

    return this.getToolHandlers();
  }
}
