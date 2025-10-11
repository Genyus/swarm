import { FieldMetadata } from '../../../contracts/field-metadata';
import { SwarmGenerator } from '../../../contracts/generator';
import { ExtendedSchema } from '../../../common/schema';

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
 * Factory for creating MCP tools from SwarmGenerator schemas.
 * This mirrors the CommandFactory pattern but for MCP tools.
 */
export class ToolFactory {
  /**
   * Create an MCP tool definition from a generator's schema
   * @param generator The generator to create a tool for
   * @returns MCP tool definition
   */
  static createToolDefinition(generator: SwarmGenerator): MCPToolDefinition {
    const schema = generator.schema as ExtendedSchema;
    const shape = (schema as any)._def?.shape;

    if (!shape) {
      throw new Error(`Invalid schema for generator '${generator.name}'`);
    }

    const properties: Record<string, any> = {};
    const required: string[] = [];

    Object.keys(shape).forEach((fieldName) => {
      const fieldSchema = shape[fieldName];
      const metadata = fieldSchema._metadata as FieldMetadata | undefined;
      const isRequired = !fieldSchema._def?.typeName?.includes('Optional');

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
  static createToolHandler(generator: SwarmGenerator): MCPToolHandler {
    return async (args: any) => {
      try {
        // Validate arguments using the generator's schema
        const validatedArgs = generator.schema.parse(args);

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
  static createTool(generator: SwarmGenerator): {
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
    fieldSchema: any,
    metadata?: FieldMetadata
  ): any {
    const typeName = fieldSchema._def?.typeName;
    const description = metadata?.description || '';

    // Map Zod types to JSON Schema types
    switch (typeName) {
      case 'ZodString':
        return {
          type: 'string',
          description,
          ...(metadata?.examples && { examples: metadata.examples }),
        };

      case 'ZodNumber':
        return {
          type: 'number',
          description,
        };

      case 'ZodBoolean':
        return {
          type: 'boolean',
          description,
        };

      case 'ZodArray': {
        const elementSchema = fieldSchema._def?.type;
        return {
          type: 'array',
          items: this.convertZodToJSONSchema(elementSchema),
          description,
        };
      }

      case 'ZodEnum':
        return {
          type: 'string',
          enum: fieldSchema._def?.values,
          description,
        };

      case 'ZodOptional':
        return this.convertZodToJSONSchema(fieldSchema._def?.innerType);

      case 'ZodDefault':
        return {
          ...this.convertZodToJSONSchema(fieldSchema._def?.innerType),
          default: fieldSchema._def?.defaultValue(),
        };

      default:
        return {
          type: 'string',
          description,
        };
    }
  }
}
