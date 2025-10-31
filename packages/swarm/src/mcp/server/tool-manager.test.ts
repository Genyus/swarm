import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import type { SwarmGenerator } from '../../generator';
import { commandRegistry } from '../../schema';
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

  describe('Plugin Loading', () => {
    it('should load tools from plugin generators', async () => {
      const mockGenerators: SwarmGenerator[] = [
        {
          name: 'api',
          description: 'Generate API endpoint',
          schema: z.object({
            name: z.string().describe('API endpoint name'),
            method: z.enum(['GET', 'POST']).describe('HTTP method'),
          }),
          generate: vi.fn().mockResolvedValue(undefined),
        },
        {
          name: 'crud',
          description: 'Generate CRUD operations',
          schema: z.object({
            entity: z.string().describe('Entity name'),
          }),
          generate: vi.fn().mockResolvedValue(undefined),
        },
      ];

      const mockPluginManager = toolManager.getPluginManager();
      vi.mocked(mockPluginManager.getEnabledGenerators).mockReturnValue(
        mockGenerators
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

    it('should create valid JSON schema from Zod schema', async () => {
      const mockGenerator: SwarmGenerator = {
        name: 'test',
        description: 'Test generator',
        schema: z.object({
          name: z.string().describe('Name field'),
          count: z.number().optional().describe('Optional count'),
          type: z.enum(['A', 'B']).optional().describe('Type selection'),
          tags: z.array(z.string()).describe('List of tags'),
          enabled: z.boolean().default(true).describe('Enable feature'),
        }),
        generate: vi.fn().mockResolvedValue(undefined),
      };

      const mockPluginManager = toolManager.getPluginManager();
      vi.mocked(mockPluginManager.getEnabledGenerators).mockReturnValue([
        mockGenerator,
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
      const mockGenerator: SwarmGenerator = {
        name: 'api',
        description: 'Generate API',
        schema: z.object({
          name: z.string(),
        }),
        generate: generateFn,
      };

      const mockPluginManager = toolManager.getPluginManager();
      vi.mocked(mockPluginManager.getEnabledGenerators).mockReturnValue([
        mockGenerator,
      ]);

      await toolManager.initialize();

      const toolHandlers = toolManager.getToolHandlers();
      const apiHandler = toolHandlers['generate-api'];

      const result = await apiHandler({ name: 'test-api' });

      expect(result.success).toBe(true);
      expect(generateFn).toHaveBeenCalledWith({ name: 'test-api' });
    });

    it('should handle generator errors gracefully', async () => {
      const generateFn = vi
        .fn()
        .mockRejectedValue(new Error('Generation failed'));
      const mockGenerator: SwarmGenerator = {
        name: 'api',
        description: 'Generate API',
        schema: z.object({
          name: z.string(),
        }),
        generate: generateFn,
      };

      const mockPluginManager = toolManager.getPluginManager();
      vi.mocked(mockPluginManager.getEnabledGenerators).mockReturnValue([
        mockGenerator,
      ]);

      await toolManager.initialize();

      const toolHandlers = toolManager.getToolHandlers();
      const apiHandler = toolHandlers['generate-api'];

      const result = await apiHandler({ name: 'test-api' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Generation failed');
    });
  });
});
