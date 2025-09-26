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
export const QUERY_TYPES = ['get', 'getAll', 'getFiltered'] as const;
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
  GETFILTERED: 'getFiltered',
} as const;
/**
 * Type for valid operation values.
 */
export type Operation = (typeof OPERATIONS)[keyof typeof OPERATIONS];

/**
 * Type for valid CRUD operation values.
 */
export type CrudOperation = 'create' | 'get' | 'getAll' | 'update' | 'delete';

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
