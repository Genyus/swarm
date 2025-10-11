import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { CommandFactory } from './command-factory';
import { commandRegistry } from './command-registry';

// Mock the options module
vi.mock('./options', () => ({
  createCommandBuilder: vi.fn(() => ({
    withFeature: vi.fn().mockReturnThis(),
    withName: vi.fn().mockReturnThis(),
    withPath: vi.fn().mockReturnThis(),
    withEntities: vi.fn().mockReturnThis(),
    withAuth: vi.fn().mockReturnThis(),
    withForce: vi.fn().mockReturnThis(),
    build: vi.fn(() => new Command('test')),
  })),
}));

describe('CommandFactory', () => {
  beforeEach(() => {
    commandRegistry.clear();
  });

  describe('createCommandWithBuilder', () => {
    it('should create a command using a custom option builder', () => {
      const testSchema = z.object({
        name: z.string(),
      });
      const handler = vi.fn();
      const optionBuilder = vi.fn(() => new Command('custom-test'));
      const cmd = CommandFactory.createCommand({
        name: 'custom-command',
        description: 'Custom command',
        schema: testSchema,
        handler,
        optionBuilder,
      });

      expect(cmd).toBeInstanceOf(Command);
      expect(optionBuilder).toHaveBeenCalled();
      expect(commandRegistry.hasCommand('custom-command')).toBe(true);
    });
  });

  describe('utility methods', () => {
    beforeEach(() => {
      const testSchema = z.object({ name: z.string() });
      const handler = vi.fn();

      commandRegistry.registerCommand('cmd1', 'Command 1', testSchema, handler);
      commandRegistry.registerCommand('cmd2', 'Command 2', testSchema, handler);
    });

    it('should get all registered commands', () => {
      const commands = CommandFactory.getRegisteredCommands();

      expect(commands).toHaveLength(2);
      expect(commands[0].name).toBe('cmd1');
      expect(commands[1].name).toBe('cmd2');
    });

    it('should check if command is registered', () => {
      expect(CommandFactory.isCommandRegistered('cmd1')).toBe(true);
      expect(CommandFactory.isCommandRegistered('nonexistent')).toBe(false);
    });
  });

  describe('command execution', () => {
    it('should handle command execution errors gracefully', async () => {
      const testSchema = z.object({
        name: z.string(),
      });
      const error = new Error('Handler execution failed');
      const handler = vi.fn().mockRejectedValue(error);
      // Mock console.error and process.exit
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const processSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      // Test the registry directly instead of through Commander.js
      commandRegistry.registerCommand(
        'error-command',
        'Command that fails',
        testSchema,
        handler
      );

      // Test registry execution directly
      await expect(
        commandRegistry.executeCommand('error-command', { name: 'test' })
      ).rejects.toThrow('Handler execution failed');

      consoleSpy.mockRestore();
      processSpy.mockRestore();
    });

    it('should handle validation errors gracefully', async () => {
      const testSchema = z.object({
        name: z.string(),
        required: z.number(),
      });
      const handler = vi.fn();
      // Test the registry directly instead of through Commander.js
      commandRegistry.registerCommand(
        'validation-error-command',
        'Command with validation error',
        testSchema,
        handler
      );

      // Test registry execution with invalid args
      await expect(
        commandRegistry.executeCommand('validation-error-command', {
          name: 'test',
        })
      ).rejects.toThrow('Invalid input:');
    });
  });
});
