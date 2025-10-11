import { Command } from 'commander';
import { SwarmGenerator } from '../contracts';
import { GeneratorInterfaceManager } from '../plugin';
import { CommandFactory } from './command-factory';

/**
 * Manages CLI commands created from generators
 * Provides a unified interface for command registration and management
 */
export class CommandManager extends GeneratorInterfaceManager<Command> {
  /**
   * Create a Commander.js command from a generator
   */
  protected async createInterfaceFromGenerator(
    generator: SwarmGenerator
  ): Promise<Command> {
    return CommandFactory.createCommandFromSchema(
      generator.name,
      generator.description || `Generate ${generator.name}`,
      generator.schema,
      async (args: any) => {
        await generator.generate(args);
      }
    );
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
