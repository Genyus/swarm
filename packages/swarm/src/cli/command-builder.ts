import { Command } from 'commander';

/**
 * Command builder class that properly handles type accumulation for Commander.js commands.
 * This ensures TypeScript can track type changes as options are added.
 */
// TODO: review necessity of this class
export class CommandBuilder<
  T extends any[] = [],
  U extends Record<string, any> = {},
> {
  constructor(private cmd: Command<T, U>) {}
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
