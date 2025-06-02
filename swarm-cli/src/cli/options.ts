import { Command } from "commander";

/**
 * Adds the --feature <feature> option (required) to a Commander command.
 * @param cmd - The Commander command
 * @returns The command with the option added
 */
export function withFeatureOption(cmd: Command) {
  return cmd.requiredOption("--feature <feature>", "Feature name (kebab-case)");
}

/**
 * Adds the --force option to a Commander command.
 * @param cmd - The Commander command
 * @returns The command with the option added
 */
export function withForceOption(cmd: Command) {
  return cmd.option("--force", "Overwrite existing files");
}

/**
 * Adds the --entities <entities> option to a Commander command.
 * @param cmd - The Commander command
 * @returns The command with the option added
 */
export function withEntitiesOption(cmd: Command) {
  return cmd.option("--entities <entities>", "Comma-separated entity names");
}

/**
 * Adds the --auth option to a Commander command.
 * @param cmd - The Commander command
 * @returns The command with the option added
 */
export function withAuthOption(cmd: Command) {
  return cmd.option("--auth", "Require authentication");
}

/**
 * Adds the --name <name> option (required) to a Commander command.
 * @param cmd - The Commander command
 * @returns The command with the option added
 */
export function withNameOption(cmd: Command) {
  return cmd.requiredOption("--name <name>", "Name");
}

/**
 * Adds the --path <path> option (required) to a Commander command.
 * @param cmd - The Commander command
 * @returns The command with the option added
 */
export function withPathOption(cmd: Command) {
  return cmd.requiredOption("--path <path>", "Path");
}

/**
 * Adds the --dataType <dataType> option (required) to a Commander command.
 * @param cmd - The Commander command
 * @returns The command with the option added
 */
export function withDataTypeOption(cmd: Command) {
  return cmd.requiredOption("--dataType <dataType>", "Model/type name");
}
