import { Command } from 'commander';

/**
 * Adds the --feature <feature> option (required) to a Commander command.
 * @param cmd - The Commander command
 * @returns The command with the option added
 */
export function withFeatureOption(cmd: Command) {
  return cmd.requiredOption(
    '-f, --feature <feature>',
    'Feature name (kebab-case)'
  );
}

/**
 * Adds the --force option to a Commander command.
 * @param cmd - The Commander command
 * @returns The command with the option added
 */
export function withForceOption(cmd: Command) {
  return cmd.option('-F, --force', 'Overwrite existing files');
}

/**
 * Adds the --entities <entities> option to a Commander command.
 * @param cmd - The Commander command
 * @returns The command with the option added
 */
export function withEntitiesOption(cmd: Command) {
  return cmd.option(
    '-e, --entities <entities>',
    'Comma-separated entity names'
  );
}

/**
 * Adds the --auth option to a Commander command.
 * @param cmd - The Commander command
 * @returns The command with the option added
 */
export function withAuthOption(cmd: Command) {
  return cmd.option('-a, --auth', 'Require authentication');
}

/**
 * Adds the --name <name> option (required) to a Commander command.
 * @param cmd - The Commander command
 * @param description - Optional custom description for the name option
 * @returns The command with the option added
 */
export function withNameOption(cmd: Command, description?: string) {
  return cmd.requiredOption('-n, --name <name>', description || 'Name');
}

/**
 * Adds the --path <path> option (required) to a Commander command.
 * @param cmd - The Commander command
 * @param description - Optional custom description for the path option
 * @returns The command with the option added
 */
export function withPathOption(cmd: Command, description?: string) {
  return cmd.requiredOption('-p, --path <path>', description || 'Path');
}
