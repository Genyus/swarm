import { error } from '@ingenyus/swarm-core';
import { Command } from 'commander';
import { z, ZodSchema } from 'zod';
import { createCommandBuilder } from './command-builder';
import { CommandInfo, commandRegistry } from './command-registry';

/**
 * Configuration for creating a command with the registry
 */
export interface CommandConfig<TArgs = any> {
  name: string;
  description: string;
  schema: ZodSchema<TArgs>;
  handler: (args: TArgs) => Promise<void>;
  additionalOptions?: (cmd: Command) => Command;
}

/**
 * Configuration for creating a command with CommandBuilder
 */
export interface CommandBuilderConfig<TArgs = any> {
  name: string;
  description: string;
  schema: z.ZodType<any, any, any>;
  handler: (args: TArgs) => Promise<void>;
  optionBuilder: (builder: ReturnType<typeof createCommandBuilder>) => Command;
}

/**
 * Factory for creating type-safe CLI commands that integrate with the CommandRegistry.
 * This bridges the gap between our type-safe registry and Commander.js.
 */
export class CommandFactory {
  /**
   * Create a command with custom option building using CommandBuilder.
   *
   * @param config - Command configuration with optionBuilder
   * @returns A Commander.js command
   */
  static createCommand<TArgs>(config: CommandBuilderConfig<TArgs>): Command {
    const { name, description, schema, handler, optionBuilder } = config;

    commandRegistry.registerCommand(name, description, schema, handler);

    const cmd = optionBuilder(createCommandBuilder(new Command(), name));

    cmd.description(description);
    cmd.action(async (rawArgs: unknown) => {
      try {
        await commandRegistry.executeCommand(name, rawArgs);
      } catch (err: any) {
        error(`Error executing '${name}' command`, err);
        process.exit(1);
      }
    });

    return cmd;
  }

  /**
   * Get all registered commands from the registry.
   *
   * @returns Array of command information
   */
  static getRegisteredCommands(): CommandInfo[] {
    return commandRegistry.getAllCommands();
  }

  /**
   * Check if a command is registered.
   *
   * @param commandName - The name of the command
   * @returns True if the command is registered
   */
  static isCommandRegistered(commandName: string): boolean {
    return commandRegistry.hasCommand(commandName);
  }
}
