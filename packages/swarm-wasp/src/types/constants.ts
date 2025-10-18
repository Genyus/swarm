import {
  ApiFlags,
  ApiNamespaceFlags,
  CrudFlags,
  JobFlags,
  OperationFlags,
  RouteFlags,
} from '../generators/args.types.js';

export const PLUGIN_NAME = 'wasp' as const;
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
const ACTION_TYPES = ['create', 'update', 'delete'] as const;
/**
 * Type for valid action types.
 */
type ActionType = (typeof ACTION_TYPES)[number];

/**
 * List of valid query types.
 */
const QUERY_TYPES = ['get', 'getAll', 'getFiltered'] as const;
/**
 * Type for valid query types.
 */
type QueryType = (typeof QUERY_TYPES)[number];

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
  GETFILTERED: 'getFiltered',
} as const;
/**
 * Type for valid operation values.
 */
type Operation = (typeof OPERATIONS)[keyof typeof OPERATIONS];

export const CRUD_OPERATIONS = {
  CREATE: 'create',
  GET: 'get',
  GETALL: 'getAll',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

/**
 * Type for valid CRUD operation values.
 */
export type CrudOperation =
  (typeof CRUD_OPERATIONS)[keyof typeof CRUD_OPERATIONS];

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
  GETFILTERED: 'getFiltered',
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
export const CONFIG_TYPES = {
  ROUTE: 'Route',
  QUERY: 'Query',
  ACTION: 'Action',
  JOB: 'Job',
  API: 'Api',
  API_NAMESPACE: 'ApiNamespace',
  CRUD: 'Crud',
} as const;
/**
 * Type for valid config type values.
 */
export type ConfigType = (typeof CONFIG_TYPES)[keyof typeof CONFIG_TYPES];
/**
 * Maps config types to their corresponding flags types
 */
interface ConfigToFlagsMap {
  API: ApiFlags;
  JOB: JobFlags;
  ROUTE: RouteFlags;
  QUERY: OperationFlags;
  ACTION: OperationFlags;
  CRUD: CrudFlags;
  API_NAMESPACE: ApiNamespaceFlags;
}

/**
 * Type helper to get flags type from config type
 */
export type GetFlagsType<T extends ConfigType> =
  T extends keyof ConfigToFlagsMap ? ConfigToFlagsMap[T] : never;

/**
 * Reverse mapping from flags types to config types
 */
type FlagsToConfigMap = {
  [K in keyof ConfigToFlagsMap]: ConfigToFlagsMap[K] extends infer U
    ? U extends ConfigToFlagsMap[K]
      ? K
      : never
    : never;
};

/**
 * Type helper to get config type from flags type
 */
type GetConfigType<T> = {
  [K in keyof ConfigToFlagsMap]: T extends ConfigToFlagsMap[K] ? K : never;
}[keyof ConfigToFlagsMap];
