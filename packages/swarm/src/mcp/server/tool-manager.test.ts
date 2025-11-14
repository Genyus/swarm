import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Generator,
  GeneratorProvider,
  GeneratorServices,
} from '../../generator';
import {
  registerSchemaMetadata,
  SchemaMetadata,
  StandardSchemaV1,
} from '../../schema';
import { ToolManager } from './tool-manager';

vi.mock('../../plugin/plugin-manager', () => ({
  PluginManager: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    getEnabledGenerators: vi.fn().mockReturnValue([]),
  })),
}));

describe('ToolManager', () => {
  let toolManager: ToolManager;

  beforeEach(() => {
    toolManager = new ToolManager();
  });

  const createSchema = (metadata: SchemaMetadata): StandardSchemaV1 => {
    const schema: StandardSchemaV1 = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: (value) => ({ value }),
      },
    };

    registerSchemaMetadata(schema, metadata);
    return schema;
  };

  describe('Plugin Loading', () => {
    it('should load tools from plugin generators', async () => {
      const apiSchema = createSchema({
        fields: {
          name: {
            type: 'string',
            description: 'API endpoint name',
            required: true,
          },
          method: {
            type: 'enum',
            description: 'HTTP method',
            enumValues: ['GET', 'POST'],
            required: true,
          },
        },
      });
      const crudSchema = createSchema({
        fields: {
          entity: {
            type: 'string',
            description: 'Entity name',
            required: true,
          },
        },
      });
      const mockProviders: GeneratorProvider[] = [
        {
          create: (services: GeneratorServices): Generator => ({
            name: 'api',
            description: 'Generate API endpoint',
            schema: apiSchema,
            generate: vi.fn().mockResolvedValue(undefined),
          }),
        },
        {
          create: (services: GeneratorServices): Generator => ({
            name: 'crud',
            description: 'Generate CRUD operations',
            schema: crudSchema,
            generate: vi.fn().mockResolvedValue(undefined),
          }),
        },
      ];

      const mockPluginManager = toolManager.getPluginManager();
      vi.mocked(mockPluginManager.getEnabledGenerators).mockReturnValue(
        mockProviders
      );

      await toolManager.initialize();

      const toolDefinitions = toolManager.getToolDefinitions();
      const toolHandlers = toolManager.getToolHandlers();

      expect(Object.keys(toolDefinitions)).toHaveLength(2);
      expect(Object.keys(toolHandlers)).toHaveLength(2);

      expect(toolDefinitions['generate-api']).toBeDefined();
      expect(toolDefinitions['generate-api'].name).toBe('generate-api');
      expect(toolDefinitions['generate-api'].description).toBe(
        'Generate API endpoint'
      );

      expect(toolDefinitions['generate-crud']).toBeDefined();
      expect(toolDefinitions['generate-crud'].name).toBe('generate-crud');

      expect(toolHandlers['generate-api']).toBeTypeOf('function');
      expect(toolHandlers['generate-crud']).toBeTypeOf('function');
    });

    it('should create valid JSON schema from metadata', async () => {
      const testSchema = createSchema({
        fields: {
          name: {
            type: 'string',
            description: 'Name field',
            required: true,
          },
          count: {
            type: 'number',
            description: 'Optional count',
            required: false,
          },
          type: {
            type: 'enum',
            description: 'Type selection',
            enumValues: ['A', 'B'],
            required: false,
          },
          tags: {
            type: 'array',
            description: 'List of tags',
            required: true,
            elementType: { type: 'string' },
          },
          enabled: {
            type: 'boolean',
            description: 'Enable feature',
            required: true,
            defaultValue: true,
          },
        },
      });
      const mockProvider: GeneratorProvider = {
        create: (services: GeneratorServices): Generator => ({
          name: 'test',
          description: 'Test generator',
          schema: testSchema,
          generate: vi.fn().mockResolvedValue(undefined),
        }),
      };

      const mockPluginManager = toolManager.getPluginManager();
      vi.mocked(mockPluginManager.getEnabledGenerators).mockReturnValue([
        mockProvider,
      ]);

      await toolManager.initialize();

      const toolDefinitions = toolManager.getToolDefinitions();
      const testTool = toolDefinitions['generate-test'];

      expect(testTool).toBeDefined();
      expect(testTool.inputSchema.properties).toMatchObject({
        name: {
          type: 'string',
          description: 'Name field',
        },
        count: {
          type: 'number',
          description: 'Optional count',
        },
        type: {
          type: 'string',
          enum: ['A', 'B'],
          description: 'Type selection',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of tags',
        },
        enabled: {
          type: 'boolean',
          default: true,
          description: 'Enable feature',
        },
      });

      expect(testTool.inputSchema.required).toEqual([
        'name',
        'tags',
        'enabled',
      ]);
    });

    it('should execute generator when tool handler is called', async () => {
      const generateFn = vi.fn().mockResolvedValue(undefined);
      const apiSchema = createSchema({
        fields: {
          name: { type: 'string', required: true },
        },
      });
      const mockProvider: GeneratorProvider = {
        create: (services: GeneratorServices): Generator => ({
          name: 'api',
          description: 'Generate API',
          schema: apiSchema,
          generate: generateFn,
        }),
      };

      const mockPluginManager = toolManager.getPluginManager();
      vi.mocked(mockPluginManager.getEnabledGenerators).mockReturnValue([
        mockProvider,
      ]);

      await toolManager.initialize();

      const toolHandlers = toolManager.getToolHandlers();
      const apiHandler = toolHandlers['generate-api'];

      const result = await apiHandler({ name: 'test-api' });

      // Tool handler now returns SDK-compatible CallToolResult format
      expect(result).toHaveProperty('content');
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');

      const parsedText = JSON.parse(result.content[0].text);
      expect(parsedText.success).toBe(true);
      expect(generateFn).toHaveBeenCalledWith({ name: 'test-api' });
    });

    it('should handle generator errors gracefully', async () => {
      const generateFn = vi
        .fn()
        .mockRejectedValue(new Error('Generation failed'));
      const apiSchema = createSchema({
        fields: {
          name: { type: 'string', required: true },
        },
      });
      const mockProvider: GeneratorProvider = {
        create: (services: GeneratorServices): Generator => ({
          name: 'api',
          description: 'Generate API',
          schema: apiSchema,
          generate: generateFn,
        }),
      };

      const mockPluginManager = toolManager.getPluginManager();
      vi.mocked(mockPluginManager.getEnabledGenerators).mockReturnValue([
        mockProvider,
      ]);

      await toolManager.initialize();

      const toolHandlers = toolManager.getToolHandlers();
      const apiHandler = toolHandlers['generate-api'];

      // Tool handler now throws errors (SDK will handle formatting)
      await expect(apiHandler({ name: 'test-api' })).rejects.toThrow(
        'Generation failed'
      );
      expect(generateFn).toHaveBeenCalledWith({ name: 'test-api' });
    });
  });
});
