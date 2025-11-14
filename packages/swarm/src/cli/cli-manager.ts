import { Command } from 'commander';
import { realFileSystem, toKebabCase } from '../common';
import { GeneratorProvider, getGeneratorServices } from '../generator';
import { PluginInterfaceManager } from '../plugin';
import {
  SchemaFieldMetadata,
  SchemaManager,
  StandardSchemaV1,
  standardValidate,
} from '../schema';
import { getCLILogger } from './cli-logger';

/**
 * Manages CLI commands created from generators
 * Provides a unified interface for command registration and management
 */
export class CLIManager extends PluginInterfaceManager<Command> {
  private commands = new Map<
    string,
    { schema: StandardSchemaV1; provider: GeneratorProvider }
  >();

  /**
   * Create a Commander.js command from a generator provider
   */
  protected async createInterfaceFromProvider(
    provider: GeneratorProvider
  ): Promise<Command> {
    // Create a temporary generator instance to get metadata
    const tempServices = {
      fileSystem: realFileSystem,
      logger: getCLILogger(),
    };
    const generator = await provider.create(tempServices);
    const name = generator.name;
    const description = generator.description || `Generate ${generator.name}`;
    const schema = generator.schema;
    const shape = SchemaManager.getShape(schema);
    const command = new Command(name).description(description);

    this.commands.set(name, {
      schema,
      provider,
    });

    if (shape) {
      Object.entries(shape).forEach(([fieldName, fieldSchema]) => {
        this.addOptionFromField(command, fieldName, fieldSchema);
      });
    }

    command.action(async (rawArgs: unknown) => {
      try {
        await this.executeCommand(name, rawArgs);
      } catch (err: any) {
        console.error('Error:', err.message);
        process.exit(1);
      }
    });

    return command;
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

    const validatedArgs = await this.validateArgs(commandInfo.schema, rawArgs);
    const logger = getCLILogger();
    const services = getGeneratorServices('cli', logger);
    const generator = await commandInfo.provider.create(services);

    await generator.generate(validatedArgs);
  }

  private async validateArgs(schema: StandardSchemaV1, rawArgs: unknown) {
    const result = await standardValidate(schema, rawArgs as any);
    if (result.issues) {
      const errorMessages = result.issues
        .map((issue) => `${issue.message}${this.formatIssuePath(issue.path)}`)
        .join('\n');
      throw new Error(errorMessages);
    }
    return result.value;
  }

  private formatIssuePath(
    path?: ReadonlyArray<PropertyKey | { key: PropertyKey }>
  ): string {
    if (!path || path.length === 0) return '';
    const rendered = path
      .map((segment) =>
        typeof segment === 'object' && 'key' in segment
          ? String(segment.key)
          : String(segment)
      )
      .join('.');
    return rendered ? ` (${rendered})` : '';
  }

  /**
   * Add a CLI option from a schema field
   */
  private addOptionFromField(
    command: Command,
    fieldName: string,
    fieldSchema: SchemaFieldMetadata
  ): void {
    const metadata = SchemaManager.getCommandMetadata(fieldSchema);
    const isRequired = SchemaManager.isFieldRequired(fieldSchema);
    const typeName = SchemaManager.getFieldTypeName(fieldSchema);
    const isArray = typeName === 'array';
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
      command.option(optionString, description);
    } else if (isArray) {
      if (isRequired) {
        optionString += ` <${argName}...>`;
        command.requiredOption(optionString, description);
      } else {
        optionString += ` [${argName}...]`;
        command.option(optionString, description);
      }
    } else if (isRequired) {
      optionString += ` <${argName}>`;
      command.requiredOption(optionString, description);
    } else {
      optionString += ` [${argName}]`;
      command.option(optionString, description);
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
