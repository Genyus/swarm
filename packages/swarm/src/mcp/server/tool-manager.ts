import { ZodType } from 'zod';
import { Generator } from '../../generator';
import { PluginInterfaceManager } from '../../plugin';
import { ExtendedSchema, FieldMetadata, SchemaManager } from '../../schema';

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
  /**
   * Create an MCP tool from a generator
   */
  protected async createInterfaceFromGenerator(
    generator: Generator
  ): Promise<MCPTool> {
    return this.createTool(generator);
  }

  /**
   * Create an MCP tool definition from a generator's schema
   */
  private createToolDefinition(generator: Generator): MCPToolDefinition {
    const schema = generator.schema as ExtendedSchema;
    const shape = SchemaManager.getShape(schema);

    if (!shape) {
      throw new Error(`Invalid schema for generator '${generator.name}'`);
    }

    const properties: Record<string, any> = {};
    const required: string[] = [];

    Object.keys(shape).forEach((fieldName) => {
      const fieldSchema = shape[fieldName] as ZodType;
      const metadata = SchemaManager.getFieldMetadata(fieldSchema);
      const isRequired = SchemaManager.isFieldRequired(fieldSchema);

      if (isRequired) {
        required.push(fieldName);
      }

      properties[fieldName] = this.convertZodToJSONSchema(
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
   * Create an MCP tool handler from a generator
   */
  private createToolHandler(generator: Generator): MCPToolHandler {
    return async (args: any) => {
      try {
        const validatedArgs = generator.schema.parse(args);
        await generator.generate(validatedArgs);

        return {
          success: true,
          message: `Successfully executed generator '${generator.name}'`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    };
  }

  /**
   * Create both tool definition and handler for a generator
   */
  private createTool(generator: Generator): MCPTool {
    return {
      definition: this.createToolDefinition(generator),
      handler: this.createToolHandler(generator),
    };
  }

  /**
   * Convert a Zod schema to JSON Schema format
   */
  private convertZodToJSONSchema(
    fieldSchema: ZodType,
    metadata?: FieldMetadata
  ): Record<string, any> {
    const typeName = SchemaManager.getFieldTypeName(fieldSchema);
    const description =
      (fieldSchema as any).description || metadata?.description || '';

    switch (typeName) {
      case 'string':
        return {
          type: 'string',
          description,
          ...(metadata?.examples && { examples: metadata.examples }),
        };

      case 'number':
        return {
          type: 'number',
          description,
        };

      case 'boolean':
        return {
          type: 'boolean',
          description,
        };

      case 'array': {
        const elementSchema = SchemaManager.getArrayElement(fieldSchema);

        return {
          type: 'array',
          items: elementSchema
            ? this.convertZodToJSONSchema(elementSchema)
            : { type: 'string' },
          description,
        };
      }

      case 'enum': {
        const values = SchemaManager.getEnumValues(fieldSchema);

        return {
          type: 'string',
          enum: values || [],
          description,
        };
      }

      case 'optional': {
        const innerType = SchemaManager.getInnerType(fieldSchema);

        if (innerType) {
          const innerMetadata = SchemaManager.getFieldMetadata(innerType);
          const innerSchema = this.convertZodToJSONSchema(
            innerType,
            innerMetadata || metadata
          );

          return {
            ...innerSchema,
            description: description || innerSchema.description,
          };
        }

        return { type: 'string', description };
      }

      case 'default': {
        const defaultInfo = SchemaManager.getDefaultInnerType(fieldSchema);

        if (defaultInfo) {
          const innerSchema = this.convertZodToJSONSchema(
            defaultInfo.innerType
          );

          return {
            ...innerSchema,
            description: description || innerSchema.description,
            default: defaultInfo.defaultValue,
          };
        }

        return { type: 'string', description };
      }

      default:
        return {
          type: 'string',
          description,
        };
    }
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
