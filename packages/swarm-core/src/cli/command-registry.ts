import { z, ZodType } from 'zod';

/**
 * Information about a registered command
 */
export interface CommandInfo<TArgs = any> {
  name: string;
  description: string;
  schema: ZodType<TArgs>;
  handler: (args: TArgs) => Promise<void>;
}

/**
 * Type-safe command registry that maps command names to their argument types and schemas.
 * Provides compile-time type safety for command handlers using TypeScript generics and Zod schemas.
 */
export class CommandRegistry {
  private commands = new Map<string, CommandInfo>();

  /**
   * Register a command with its argument type, validation schema, and handler.
   *
   * @param commandName - The name of the command
   * @param description - Description of the command
   * @param schema - Zod schema for validating command arguments
   * @param handler - Type-safe handler function that receives validated arguments
   *
   * @example
   * ```typescript
   * registry.registerCommand(
   *   'api',
   *   'Generate an API endpoint',
   *   apiCommandSchema,
   *   async (args: ApiCommandArgs) => {
   *     // args is fully typed and validated
   *     await generator.generate(args.feature, { ... });
   *   }
   * );
   * ```
   */
  registerCommand<TArgs>(
    commandName: string,
    description: string,
    schema: ZodType<TArgs>,
    handler: (args: TArgs) => Promise<void>
  ): void {
    if (this.commands.has(commandName)) {
      throw new Error(`Command '${commandName}' is already registered`);
    }

    this.commands.set(commandName, {
      name: commandName,
      description,
      schema,
      handler,
    });
  }

  /**
   * Execute a command with raw arguments, validating them against the schema.
   *
   * @param commandName - The name of the command to execute
   * @param rawArgs - Raw arguments to validate and pass to the handler
   * @throws {Error} If command is not found or validation fails
   */
  async executeCommand(commandName: string, rawArgs: unknown): Promise<void> {
    const commandInfo = this.commands.get(commandName);

    if (!commandInfo) {
      throw new Error(`Command '${commandName}' not found`);
    }

    try {
      // Validate the arguments using the schema
      const validatedArgs = commandInfo.schema.parse(rawArgs);

      // Execute the handler with validated arguments
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
   * Get information about a registered command.
   *
   * @param commandName - The name of the command
   * @returns Command information or undefined if not found
   */
  getCommandInfo<TArgs = any>(
    commandName: string
  ): CommandInfo<TArgs> | undefined {
    return this.commands.get(commandName) as CommandInfo<TArgs> | undefined;
  }

  /**
   * Get all registered command names.
   *
   * @returns Array of command names
   */
  getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Get all registered commands.
   *
   * @returns Array of command information
   */
  getAllCommands(): CommandInfo[] {
    return Array.from(this.commands.values());
  }

  /**
   * Check if a command is registered.
   *
   * @param commandName - The name of the command
   * @returns True if the command is registered
   */
  hasCommand(commandName: string): boolean {
    return this.commands.has(commandName);
  }

  /**
   * Remove a command from the registry.
   *
   * @param commandName - The name of the command to remove
   * @returns True if the command was removed, false if it wasn't found
   */
  removeCommand(commandName: string): boolean {
    return this.commands.delete(commandName);
  }

  /**
   * Clear all registered commands.
   */
  clear(): void {
    this.commands.clear();
  }

  /**
   * Get the number of registered commands.
   *
   * @returns Number of registered commands
   */
  size(): number {
    return this.commands.size;
  }
}

/**
 * Global command registry instance.
 * This can be used throughout the application for command management.
 */
export const commandRegistry = new CommandRegistry();
