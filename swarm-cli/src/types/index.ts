// Shared TypeScript types, enums, and constants for Swarm CLI

import { IFeatureGenerator, NodeGenerator } from "./generator";

/**
 * Interface for base generator commands
 * @interface IBaseGeneratorCommand
 * @property {string} name - The name of the command
 * @property {string} description - The description of the command
 * @property {IGenerator} generator - The generator instance
 */
interface BaseGeneratorCommand {
  name: string;
  description: string;
}
/**
 * Interface for node generator commands
 * @interface NodeGeneratorCommand
 * @property {string} name - The name of the command
 * @property {string} description - The description of the command
 * @property {IGenerator} generator - The generator instance
 * @property {function} register - The function to register the command
 */
export interface NodeGeneratorCommand extends BaseGeneratorCommand {
  generator: NodeGenerator;
  register(program: import("commander").Command, generator: NodeGenerator): void;
}

/**
 * Interface for feature generator commands
 * @interface FeatureGeneratorCommand
 * @property {string} name - The name of the command
 * @property {string} description - The description of the command
 * @property {IFeatureGenerator} generator - The generator instance
 * @property {function} register - The function to register the command
 */
export interface FeatureGeneratorCommand extends BaseGeneratorCommand {
  generator: IFeatureGenerator;
  register(
    program: import("commander").Command,
    generator: IFeatureGenerator
  ): void;
}

/**
 * Map of valid commands.
 */
export const COMMANDS = {
  FEATURE: "feature",
  ROUTE: "route",
  ACTION: "action",
  QUERY: "query",
  JOB: "job",
  API: "api",
  APINAMESPACE: "apinamespace",
  CRUD: "crud",
} as const;

/**
 * Type for valid command values.
 */
export type Command = (typeof COMMANDS)[keyof typeof COMMANDS];

/**
 * List of valid operation types.
 */
export const OPERATION_TYPES = ["query", "action"] as const;
/**
 * Type for valid operation types.
 */
export type OperationType = (typeof OPERATION_TYPES)[number];

/**
 * List of valid action types.
 */
export const ACTION_TYPES = ["create", "update", "delete"] as const;
/**
 * Type for valid action types.
 */
export type ActionType = (typeof ACTION_TYPES)[number];

/**
 * List of valid query types.
 */
export const QUERY_TYPES = ["get", "getAll"] as const;
/**
 * Type for valid query types.
 */
export type QueryType = (typeof QUERY_TYPES)[number];

/**
 * Map of valid operations.
 */
export const OPERATIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  GET: "get",
  GETALL: "getAll",
} as const;
/**
 * Type for valid operation values.
 */
export type Operation = (typeof OPERATIONS)[keyof typeof OPERATIONS];

/**
 * Map of valid action operations.
 */
export const ACTION_OPERATIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
} as const;
/**
 * Type for valid action operation values.
 */
export type ActionOperation =
  (typeof ACTION_OPERATIONS)[keyof typeof ACTION_OPERATIONS];

/**
 * Map of valid query operations.
 */
export const QUERY_OPERATIONS = {
  GET: "get",
  GETALL: "getAll",
} as const;
/**
 * Type for valid query operation values.
 */
export type QueryOperation =
  (typeof QUERY_OPERATIONS)[keyof typeof QUERY_OPERATIONS];

/**
 * Maps file types to their directories.
 */
export const TYPE_DIRECTORIES: Record<string, string> = {
  component: "client/components",
  hook: "client/hooks",
  layout: "client/layouts",
  page: "client/pages",
  util: "client/utils",
  action: "server/actions",
  query: "server/queries",
  middleware: "server/middleware",
  job: "server/jobs",
  api: "server/apis",
  crud: "server/cruds",
  type: "types",
};

/**
 * List of valid config types.
 */
export const CONFIG_TYPES = [
  "route",
  "query",
  "action",
  "job",
  "api",
  "apiNamespace",
  "crud",
] as const;
/**
 * Type for valid config type values.
 */
export type ConfigType = (typeof CONFIG_TYPES)[number];
