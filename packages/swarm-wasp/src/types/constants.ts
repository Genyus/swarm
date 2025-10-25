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
 * List of valid API HTTP methods.
 */
export const API_HTTP_METHODS = [
  'ALL',
  'GET',
  'POST',
  'PUT',
  'DELETE',
] as const;

/**
 * Type for valid API HTTP method values.
 */
export type ApiHttpMethod = (typeof API_HTTP_METHODS)[number];

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
