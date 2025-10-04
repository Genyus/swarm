import { Command } from 'commander';

/**
 * Command builder class that properly handles type accumulation for Commander.js commands.
 * This ensures TypeScript can track type changes as options are added.
 */
export class CommandBuilder<
  T extends any[] = [],
  U extends Record<string, any> = {},
> {
  constructor(private cmd: Command<T, U>) {}

  /**
   * Adds the --feature <feature> option (required) to the command.
   */
  withFeature(): CommandBuilder<T, U & { feature: string }> {
    const newCmd = this.cmd.requiredOption(
      '-f, --feature <feature>',
      'Feature name (kebab-case)'
    ) as unknown as Command<T, U & { feature: string }>;
    return new CommandBuilder(newCmd);
  }

  /**
   * Adds the --name <name> option (required) to the command.
   */
  withName(description?: string): CommandBuilder<T, U & { name: string }> {
    const newCmd = this.cmd.requiredOption(
      '-n, --name <name>',
      description || 'Name'
    ) as unknown as Command<T, U & { name: string }>;
    return new CommandBuilder(newCmd);
  }

  /**
   * Adds the --path <path> option (required) to the command.
   */
  withPath(description?: string): CommandBuilder<T, U & { path: string }> {
    const newCmd = this.cmd.requiredOption(
      '-p, --path <path>',
      description || 'Path'
    ) as unknown as Command<T, U & { path: string }>;
    return new CommandBuilder(newCmd);
  }

  /**
   * Adds the --entities <entities> option to the command.
   */
  withEntities(): CommandBuilder<T, U & { entities?: string }> {
    const newCmd = this.cmd.option(
      '-e, --entities <entities>',
      'Comma-separated entity names'
    ) as unknown as Command<T, U & { entities?: string }>;
    return new CommandBuilder(newCmd);
  }

  /**
   * Adds the --auth option to the command.
   */
  withAuth(): CommandBuilder<T, U & { auth?: boolean }> {
    const newCmd = this.cmd.option(
      '-a, --auth',
      'Require authentication'
    ) as unknown as Command<T, U & { auth?: boolean }>;
    return new CommandBuilder(newCmd);
  }

  /**
   * Adds the --force option to the command.
   */
  withForce(): CommandBuilder<T, U & { force?: boolean }> {
    const newCmd = this.cmd.option(
      '-F, --force',
      'Overwrite existing files'
    ) as unknown as Command<T, U & { force?: boolean }>;
    return new CommandBuilder(newCmd);
  }

  /**
   * Returns the built command with all accumulated types.
   */
  build(): Command<T, U> {
    return this.cmd;
  }
}

/**
 * Creates a new command builder starting with a base command.
 */
export function createCommandBuilder(
  program: Command,
  commandName: string
): CommandBuilder {
  return new CommandBuilder(program.command(commandName));
}
