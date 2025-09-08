// Shared TypeScript types, enums, and constants for Swarm CLI

import { IFeatureGenerator, NodeGenerator } from './generator';

/**
 * Common flags used across different generators
 * @interface CommonGeneratorFlags
 */
export interface CommonGeneratorFlags {
  /** Feature path/name */
  feature?: string;
  /** Resource name (API, Job, Route, etc.) */
  name?: string;
  /** Data type/model name */
  dataType: string;
  /** Operation type (for queries/actions) */
  operation: ActionOperation | QueryOperation;
  /** HTTP method (for APIs) */
  method?: HttpMethod;
  /** Route/API path */
  path?: string;
  /** Route path (alias for path) */
  route?: string;
  /** Entities to include */
  entities?: string | string[];
  /** Force overwrite existing files */
  force?: boolean;
  /** Require authentication */
  auth?: boolean;
  /** Cron schedule (for jobs) */
  schedule?: string;
  /** Schedule arguments (for jobs) */
  scheduleArgs?: string;
  /** Public operations (for CRUD) */
  public?: string[];
  /** Override operations (for CRUD) */
  override?: string[];
  /** Exclude operations (for CRUD) */
  exclude?: string[];
}

/**
 * Operation-specific flags
 */
export type OperationFlags = Pick<
  CommonGeneratorFlags,
  'entities' | 'force' | 'auth' | 'operation' | 'dataType'
>;

/**
 * API-specific flags
 */
export type ApiFlags = Pick<
  CommonGeneratorFlags,
  'force' | 'entities' | 'auth'
> & {
  name: string;
  method: HttpMethod;
  route: string;
};

/**
 * Job-specific flags
 */
export type JobFlags = Pick<
  CommonGeneratorFlags,
  'entities' | 'schedule' | 'scheduleArgs' | 'force'
> & {
  name: string;
};

/**
 * Route-specific flags
 */
export type RouteFlags = Pick<
  CommonGeneratorFlags,
  'name' | 'force' | 'auth'
> & {
  path: string;
};

/**
 * CRUD-specific flags
 */
export type CrudFlags = Pick<
  CommonGeneratorFlags,
  'public' | 'override' | 'exclude' | 'force' | 'dataType'
>;

/**
 * ApiNamespace-specific flags
 */
export type ApiNamespaceFlags = Pick<CommonGeneratorFlags, 'force'> & {
  name: string;
  path: string;
};

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface NodeGeneratorCommand<TFlags = any>
  extends BaseGeneratorCommand {
  generator: NodeGenerator<TFlags>;
  register(
    program: import('commander').Command,
    generator: NodeGenerator<TFlags>
  ): void;
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
    program: import('commander').Command,
    generator: IFeatureGenerator
  ): void;
}

/**
 * Map of valid commands.
 */
export const COMMANDS = {
  FEATURE: 'feature',
  ROUTE: 'route',
  ACTION: 'action',
  QUERY: 'query',
  JOB: 'job',
  API: 'api',
  APINAMESPACE: 'apinamespace',
  CRUD: 'crud',
} as const;

/**
 * Type for valid command values.
 */
export type Command = (typeof COMMANDS)[keyof typeof COMMANDS];

/**
 * List of valid operation types.
 */
export const OPERATION_TYPES = ['query', 'action'] as const;
/**
 * Type for valid operation types.
 */
export type OperationType = (typeof OPERATION_TYPES)[number];

/**
 * List of valid action types.
 */
export const ACTION_TYPES = ['create', 'update', 'delete'] as const;
/**
 * Type for valid action types.
 */
export type ActionType = (typeof ACTION_TYPES)[number];

/**
 * List of valid query types.
 */
export const QUERY_TYPES = ['get', 'getAll'] as const;
/**
 * Type for valid query types.
 */
export type QueryType = (typeof QUERY_TYPES)[number];

/**
 * List of valid HTTP methods.
 */
export const HTTP_METHODS = ['ALL', 'GET', 'POST', 'PUT', 'DELETE'] as const;
/**
 * Type for valid HTTP method values.
 */
export type HttpMethod = (typeof HTTP_METHODS)[number];

/**
 * Map of valid operations.
 */
export const OPERATIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  GET: 'get',
  GETALL: 'getAll',
} as const;
/**
 * Type for valid operation values.
 */
export type Operation = (typeof OPERATIONS)[keyof typeof OPERATIONS];

/**
 * Map of valid action operations.
 */
export const ACTION_OPERATIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
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
  GET: 'get',
  GETALL: 'getAll',
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
  component: 'client/components',
  hook: 'client/hooks',
  layout: 'client/layouts',
  page: 'client/pages',
  util: 'client/utils',
  action: 'server/actions',
  query: 'server/queries',
  middleware: 'server/middleware',
  job: 'server/jobs',
  api: 'server/apis',
  crud: 'server/cruds',
  type: 'types',
};

/**
 * List of valid config types.
 */
export const CONFIG_TYPES = [
  'route',
  'query',
  'action',
  'job',
  'api',
  'apiNamespace',
  'crud',
] as const;
/**
 * Type for valid config type values.
 */
export type ConfigType = (typeof CONFIG_TYPES)[number];

/**
 * Represents a configuration entry for an operation.
 */
export interface OperationConfigEntry {
  operationName: string;
  entities: string[];
  authRequired: boolean;
}
