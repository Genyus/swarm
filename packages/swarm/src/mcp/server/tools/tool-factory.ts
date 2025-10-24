import { ZodType } from 'zod';
import { GeneratorArgs, PluginGenerator } from '../../../generator';
import { ExtendedSchema, FieldMetadata, SchemaManager } from '../../../schema';

/**
 * MCP Tool definition interface
 */
export interface MCPToolDefinition {
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
export type MCPToolHandler = (args: any) => Promise<any>;

/**
 * Factory for creating MCP tools from PluginGenerator schemas.
 * This mirrors the CommandFactory pattern but for MCP tools.
 */
export class ToolFactory {
  /**
   * Create an MCP tool definition from a generator's schema
   * @param generator The generator to create a tool for
   * @returns MCP tool definition
   */
  static createToolDefinition(
    generator: PluginGenerator<GeneratorArgs>
  ): MCPToolDefinition {
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
      name: generator.name,
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
   * @param generator The generator to create a handler for
   * @returns MCP tool handler function
   */
  static createToolHandler(
    generator: PluginGenerator<GeneratorArgs>
  ): MCPToolHandler {
    return async (args: any) => {
      try {
        // Validate arguments using the generator's schema
        const validatedArgs = generator.schema.parse(args) as GeneratorArgs;

        // Call the generator's generate method
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
   * @param generator The generator to create a tool for
   * @returns Object containing both definition and handler
   */
  static createTool(generator: PluginGenerator<GeneratorArgs>): {
    definition: MCPToolDefinition;
    handler: MCPToolHandler;
  } {
    return {
      definition: this.createToolDefinition(generator),
      handler: this.createToolHandler(generator),
    };
  }

  /**
   * Convert a Zod schema to JSON Schema format
   * @param fieldSchema The Zod schema field
   * @param metadata Optional field metadata
   * @returns JSON Schema property definition
   */
  private static convertZodToJSONSchema(
    fieldSchema: ZodType,
    metadata?: FieldMetadata
  ): Record<string, any> {
    const typeName = SchemaManager.getFieldTypeName(fieldSchema);
    const description = metadata?.description || '';

    // Map Zod types to JSON Schema types
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

        return innerType
          ? this.convertZodToJSONSchema(innerType)
          : { type: 'string', description };
      }

      case 'default': {
        const defaultInfo = SchemaManager.getDefaultInnerType(fieldSchema);

        if (defaultInfo) {
          return {
            ...this.convertZodToJSONSchema(defaultInfo.innerType),
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
}
