import { Command } from 'commander';
import { z, ZodType } from 'zod';
import { toKebabCase } from '../common';
import { GeneratorArgs, PluginGenerator } from '../generator';
import { PluginInterfaceManager } from '../plugin';
import { ExtendedSchema, SchemaManager } from '../schema';

/**
 * Manages CLI commands created from generators
 * Provides a unified interface for command registration and management
 */
export class CommandManager extends PluginInterfaceManager<Command> {
  private commands = new Map<
    string,
    { schema: ZodType; handler: (args: any) => Promise<void> }
  >();

  /**
   * Create a Commander.js command from a generator
   */
  protected async createInterfaceFromGenerator(
    generator: PluginGenerator<GeneratorArgs>
  ): Promise<Command> {
    const name = generator.name;
    const description = generator.description || `Generate ${generator.name}`;
    const schema = generator.schema as ExtendedSchema;

    this.commands.set(name, {
      schema: schema as ZodType,
      handler: async (args: any) => {
        await generator.generate(args);
      },
    });

    const cmd = new Command(name);

    cmd.description(description);

    const shape = SchemaManager.getShape(schema);

    if (shape) {
      Object.keys(shape).forEach((fieldName) => {
        const fieldSchema = shape[fieldName] as ZodType;

        this.addOptionFromField(cmd, fieldName, fieldSchema);
      });
    }

    cmd.action(async (rawArgs: unknown) => {
      try {
        await this.executeCommand(name, rawArgs);
      } catch (err: any) {
        console.error('❌ Error:', err.message);
        process.exit(1);
      }
    });

    return cmd;
  }

  /**
   * Execute a command with raw arguments, validating them against the schema.
   */
  private async executeCommand(
    commandName: string,
    rawArgs: unknown
  ): Promise<void> {
    const commandInfo = this.commands.get(commandName);

    if (!commandInfo) {
      throw new Error(`Command '${commandName}' not found`);
    }

    try {
      const validatedArgs = commandInfo.schema.parse(rawArgs);

      await commandInfo.handler(validatedArgs);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues
          .map((err) => `'${err.path.join('.')}': ${err.message}`)
          .join('\n');

        throw new Error(errorMessages);
      }

      throw error;
    }
  }

  /**
   * Add a CLI option from a schema field
   */
  private addOptionFromField(
    cmd: Command,
    fieldName: string,
    fieldSchema: ZodType
  ): void {
    const metadata = SchemaManager.getFieldMetadata(fieldSchema);
    const isRequired = SchemaManager.isFieldRequired(fieldSchema);
    const optionName = toKebabCase(fieldName);
    const optionFlag = `--${optionName}${isRequired ? '' : ' [value]'}`;

    cmd.option(optionFlag, metadata?.description || fieldName);

    if (fieldSchema instanceof z.ZodBoolean) {
      cmd.option(`--no-${optionName}`, `Disable ${fieldName}`);
    }
  }

  /**
   * Register all commands with a main Commander.js program
   * @param program The main Commander.js program
   */
  registerCommands(program: Command): void {
    const commands = this.getInterfaces();

    for (const [name, command] of Object.entries(commands)) {
      try {
        program.addCommand(command);
      } catch (error) {
        console.warn(`Failed to register command '${name}':`, error);
      }
    }
  }

  /**
   * Get command information for debugging or introspection
   */
  getCommandInfo(): Array<{ name: string; description: string }> {
    const commands = this.getInterfaces();

    return Object.entries(commands).map(([name, command]) => ({
      name,
      description: command.description() || `Generate ${name}`,
    }));
  }
}
