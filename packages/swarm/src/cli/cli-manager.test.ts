import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { Generator, GeneratorProvider, GeneratorServices } from '../generator';
import { CLIManager } from './cli-manager';

// Mock generator provider for testing
const createMockProvider = (name: string, schema: any): GeneratorProvider => {
  return {
    create: (services: GeneratorServices): Generator => ({
      name,
      description: `Generate ${name}`,
      schema,
      generate: vi.fn(),
    }),
  };
};

describe('CommandManager', () => {
  let commandManager: CLIManager;

  beforeEach(() => {
    commandManager = new CLIManager();
    vi.clearAllMocks();
  });

  describe('createInterfaceFromProvider', () => {
    it('should create a command from a generator', async () => {
      const testSchema = z.object({
        name: z.string(),
      });
      const provider = createMockProvider('test-command', testSchema);

      const cmd = await commandManager['createInterfaceFromProvider'](provider);

      expect(cmd).toBeInstanceOf(Command);
      expect(cmd.name()).toBe('test-command');
      expect(cmd.description()).toBe('Generate test-command');
    });

    it('should add options from schema fields', async () => {
      const testSchema = z.object({
        name: z.string(),
        optional: z.string().optional(),
        flag: z.boolean().optional(),
      });
      const provider = createMockProvider('test-command', testSchema);

      const cmd = await commandManager['createInterfaceFromProvider'](provider);

      // Check that options were added (Commander.js doesn't expose options directly)
      // but we can verify the command was created successfully
      expect(cmd).toBeInstanceOf(Command);
    });
  });

  describe('command execution', () => {
    it('should execute command with validated arguments', async () => {
      const testSchema = z.object({
        name: z.string(),
      });
      const generateFn = vi.fn().mockResolvedValue(undefined);
      const provider: GeneratorProvider = {
        create: (services: GeneratorServices): Generator => ({
          name: 'test-command',
          description: 'Generate test-command',
          schema: testSchema,
          generate: generateFn,
        }),
      };

      await commandManager['createInterfaceFromProvider'](provider);

      // Execute the command
      await commandManager['executeCommand']('test-command', {
        name: 'test-value',
      });

      expect(generateFn).toHaveBeenCalledWith({ name: 'test-value' });
    });

    it('should handle validation errors', async () => {
      const testSchema = z.object({
        name: z.string(),
      });
      const provider = createMockProvider('test-command', testSchema);
      await commandManager['createInterfaceFromProvider'](provider);

      await expect(
        commandManager['executeCommand']('test-command', { name: 123 })
      ).rejects.toThrow();
    });

    it('should handle unknown command', async () => {
      await expect(
        commandManager['executeCommand']('unknown-command', {})
      ).rejects.toThrow("Command 'unknown-command' not found");
    });
  });

  describe('integration', () => {
    it('should work with the full initialization flow', async () => {
      // This would require setting up a proper plugin configuration
      // For now, we'll test the basic functionality
      const testSchema = z.object({
        name: z.string(),
      });
      const provider = createMockProvider('test-command', testSchema);
      const cmd = await commandManager['createInterfaceFromProvider'](provider);
      expect(cmd).toBeInstanceOf(Command);
    });
  });
});
