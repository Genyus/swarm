import { Command } from 'commander';
import { z, ZodType } from 'zod';
import { ExtendedSchema, SchemaManager, toKebabCase } from '../common';
import { createCommandBuilder } from './command-builder';
import { CommandInfo, commandRegistry } from './command-registry';

/**
 * Configuration for creating a command with CommandBuilder
 */
interface CommandBuilderConfig<TArgs = any> {
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
    commandRegistry.registerCommand(
      name,
      description,
      schema as ZodType<TArgs>,
      handler
    );

    // Use the command builder to create a proper sub-command
    const builder = createCommandBuilder(new Command(), name);
    const cmd = builder.build();

    cmd.description(description);

    // Extract schema shape and add options
    const shape = SchemaManager.getShape(schema);

    if (shape) {
      Object.keys(shape).forEach((fieldName) => {
        const fieldSchema = shape[fieldName] as ZodType;

        this.addOptionFromField(cmd, fieldName, fieldSchema);
      });
    }

    // Add action handler
    cmd.action(async (rawArgs: unknown) => {
      try {
        await commandRegistry.executeCommand(name, rawArgs);
      } catch (err: any) {
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
    fieldSchema: ZodType
  ): void {
    const metadata = SchemaManager.getFieldMetadata(fieldSchema);
    const isRequired = SchemaManager.isFieldRequired(fieldSchema);
    const typeName = SchemaManager.getFieldTypeName(fieldSchema);
    const argName = toKebabCase(fieldName);
    const shortName = metadata?.shortName;
    let optionString = '';
    let description = metadata?.description || `${fieldName} field`;

    if (metadata?.examples && metadata.examples.length > 0) {
      description = `${description} (examples: ${metadata.examples.join(', ')})`;
    }

    if (shortName) {
      optionString = `-${shortName}, --${argName}`;
    } else {
      optionString = `--${argName}`;
    }

    if (typeName === 'boolean') {
      cmd.option(optionString, description);
    } else if (isRequired) {
      optionString += ` <${argName}>`;
      cmd.requiredOption(optionString, description);
    } else {
      optionString += ` [${argName}]`;
      cmd.option(optionString, description);
    }
  }
}
