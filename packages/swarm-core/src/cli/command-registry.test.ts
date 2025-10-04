import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { CommandRegistry } from './command-registry';

// Test schemas
const testSchema = z.object({
  name: z.string(),
  value: z.number(),
  optional: z.boolean().optional(),
});

const invalidSchema = z.object({
  required: z.string(),
  number: z.number(),
});

describe('CommandRegistry', () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  describe('registerCommand', () => {
    it('should register a command successfully', () => {
      const handler = vi.fn();

      registry.registerCommand('test', 'Test command', testSchema, handler);

      expect(registry.hasCommand('test')).toBe(true);
      expect(registry.getCommandInfo('test')).toBeDefined();
    });

    it('should throw error when registering duplicate command', () => {
      const handler = vi.fn();

      registry.registerCommand('test', 'Test command', testSchema, handler);

      expect(() => {
        registry.registerCommand('test', 'Another test', testSchema, handler);
      }).toThrow("Command 'test' is already registered");
    });
  });

  describe('executeCommand', () => {
    it('should execute command with valid arguments', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);

      registry.registerCommand('test', 'Test command', testSchema, handler);

      const args = { name: 'test', value: 42, optional: true };
      await registry.executeCommand('test', args);

      expect(handler).toHaveBeenCalledWith(args);
    });

    it('should throw error for non-existent command', async () => {
      await expect(registry.executeCommand('nonexistent', {})).rejects.toThrow(
        "Command 'nonexistent' not found"
      );
    });

    it('should throw validation error for invalid arguments', async () => {
      const handler = vi.fn();

      registry.registerCommand('test', 'Test command', testSchema, handler);

      const invalidArgs = { name: 'test' }; // missing required 'value' field

      await expect(
        registry.executeCommand('test', invalidArgs)
      ).rejects.toThrow('Required');
    });

    it('should handle handler errors', async () => {
      const error = new Error('Handler error');
      const handler = vi.fn().mockRejectedValue(error);

      registry.registerCommand('test', 'Test command', testSchema, handler);

      const args = { name: 'test', value: 42 };

      await expect(registry.executeCommand('test', args)).rejects.toThrow(
        'Handler error'
      );
    });
  });

  describe('getCommandInfo', () => {
    it('should return command info for registered command', () => {
      const handler = vi.fn();

      registry.registerCommand('test', 'Test command', testSchema, handler);

      const info = registry.getCommandInfo('test');
      expect(info).toBeDefined();
      expect(info?.name).toBe('test');
      expect(info?.description).toBe('Test command');
    });

    it('should return undefined for non-existent command', () => {
      const info = registry.getCommandInfo('nonexistent');
      expect(info).toBeUndefined();
    });
  });

  describe('utility methods', () => {
    beforeEach(() => {
      registry.registerCommand('cmd1', 'Command 1', testSchema, vi.fn());
      registry.registerCommand('cmd2', 'Command 2', testSchema, vi.fn());
    });

    it('should return all command names', () => {
      const names = registry.getCommandNames();
      expect(names).toEqual(['cmd1', 'cmd2']);
    });

    it('should return all commands', () => {
      const commands = registry.getAllCommands();
      expect(commands).toHaveLength(2);
      expect(commands[0].name).toBe('cmd1');
      expect(commands[1].name).toBe('cmd2');
    });

    it('should check if command exists', () => {
      expect(registry.hasCommand('cmd1')).toBe(true);
      expect(registry.hasCommand('nonexistent')).toBe(false);
    });

    it('should remove command', () => {
      expect(registry.removeCommand('cmd1')).toBe(true);
      expect(registry.hasCommand('cmd1')).toBe(false);
      expect(registry.removeCommand('nonexistent')).toBe(false);
    });

    it('should clear all commands', () => {
      registry.clear();
      expect(registry.size()).toBe(0);
      expect(registry.getCommandNames()).toHaveLength(0);
    });

    it('should return correct size', () => {
      expect(registry.size()).toBe(2);
    });
  });

  describe('type safety', () => {
    it('should enforce type safety at compile time', () => {
      // This test demonstrates that TypeScript will catch type mismatches
      // at compile time when registering commands

      const handler = async (args: { name: string; value: number }) => {
        // args is properly typed
        expect(typeof args.name).toBe('string');
        expect(typeof args.value).toBe('number');
      };

      // This should work with the correct schema
      registry.registerCommand(
        'typed-test',
        'Typed test command',
        testSchema,
        handler
      );

      expect(registry.hasCommand('typed-test')).toBe(true);
    });
  });
});
