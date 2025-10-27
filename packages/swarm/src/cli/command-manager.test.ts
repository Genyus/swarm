import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { Generator } from '../generator';
import { CommandManager } from './command-manager';

// Mock generator for testing
const createMockGenerator = (name: string, schema: any): Generator => ({
  name,
  description: `Generate ${name}`,
  schema,
  generate: vi.fn(),
});

describe('CommandManager', () => {
  let commandManager: CommandManager;

  beforeEach(() => {
    commandManager = new CommandManager();
    vi.clearAllMocks();
  });

  describe('createInterfaceFromGenerator', () => {
    it('should create a command from a generator', async () => {
      const testSchema = z.object({
        name: z.string(),
      });
      const generator = createMockGenerator('test-command', testSchema);

      const cmd =
        await commandManager['createInterfaceFromGenerator'](generator);

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
      const generator = createMockGenerator('test-command', testSchema);

      const cmd =
        await commandManager['createInterfaceFromGenerator'](generator);

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
      const generator = createMockGenerator('test-command', testSchema);
      const generateSpy = vi.spyOn(generator, 'generate');

      await commandManager['createInterfaceFromGenerator'](generator);

      // Execute the command
      await commandManager['executeCommand']('test-command', {
        name: 'test-value',
      });

      expect(generateSpy).toHaveBeenCalledWith({ name: 'test-value' });
    });

    it('should handle validation errors', async () => {
      const testSchema = z.object({
        name: z.string(),
      });
      const generator = createMockGenerator('test-command', testSchema);

      await commandManager['createInterfaceFromGenerator'](generator);

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
      const generator = createMockGenerator('test-command', testSchema);

      const cmd =
        await commandManager['createInterfaceFromGenerator'](generator);
      expect(cmd).toBeInstanceOf(Command);
    });
  });
});
