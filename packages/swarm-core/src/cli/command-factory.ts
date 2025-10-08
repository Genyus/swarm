import { Command } from 'commander';
import { z, ZodType } from 'zod';
import { FieldMetadata } from '../interfaces/field-metadata';
import { error } from '../utils/errors';
import { ExtendedSchema } from '../utils/schema-builder';
import { createCommandBuilder } from './command-builder';
import { CommandInfo, commandRegistry } from './command-registry';

/**
 * Configuration for creating a command with the registry
 */
export interface CommandConfig<TArgs = any> {
  name: string;
  description: string;
  schema: ZodType<TArgs>;
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

  /**
   * Create a command from an ExtendedSchema with metadata.
   * Automatically generates CLI options from schema fields.
   *
   * @param name - Command name
   * @param description - Command description
   * @param schema - Extended schema with field metadata
   * @param handler - Command handler function
   * @returns A Commander.js command
   */
  static createCommandFromSchema<TArgs = any>(
    name: string,
    description: string,
    schema: ExtendedSchema,
    handler: (args: TArgs) => Promise<void>
  ): Command {
    // Register the command with the registry
    commandRegistry.registerCommand(name, description, schema as any, handler);

    // Create the command
    const cmd = new Command(name);
    cmd.description(description);

    // Extract schema shape and add options
    const shape = (schema as any)._def?.shape;
    if (shape) {
      Object.keys(shape).forEach((fieldName) => {
        const fieldSchema = shape[fieldName];
        const metadata = fieldSchema._metadata as FieldMetadata | undefined;
        const isRequired = !fieldSchema._def?.typeName?.includes('Optional');

        this.addOptionFromField(
          cmd,
          fieldName,
          fieldSchema,
          metadata,
          isRequired
        );
      });
    }

    // Add action handler
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
   * Add a CLI option from a schema field
   */
  private static addOptionFromField(
    cmd: Command,
    fieldName: string,
    fieldSchema: any,
    metadata: FieldMetadata | undefined,
    isRequired: boolean
  ): void {
    const typeName = fieldSchema._def?.typeName;
    const description = metadata?.description || `${fieldName} field`;
    const shortName = metadata?.shortName;

    // Build option string
    let optionString = '';
    if (shortName) {
      optionString = `-${shortName}, --${fieldName}`;
    } else {
      optionString = `--${fieldName}`;
    }

    // Add value placeholder based on type
    if (typeName === 'ZodBoolean') {
      // Boolean flags don't need value placeholder
      cmd.option(optionString, description);
    } else if (isRequired) {
      optionString += ` <${fieldName}>`;
      cmd.requiredOption(optionString, description);
    } else {
      optionString += ` [${fieldName}]`;
      cmd.option(optionString, description);
    }

    // Add examples to help text if available
    if (metadata?.examples && metadata.examples.length > 0) {
      const examples = metadata.examples.join(', ');
      cmd.option(optionString, `${description} (examples: ${examples})`);
    }
  }
}
