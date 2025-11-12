export const PLUGIN_NAME = 'wasp' as const;

/**
 * List of valid operation types.
 */
export const OPERATION_TYPES = ['query', 'action'] as const;

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
 * Map of valid action operations.
 */
export const ACTION_OPERATIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

/**
 * Map of valid query operations.
 */
export const QUERY_OPERATIONS = {
  GET: 'get',
  GETALL: 'getAll',
  GETFILTERED: 'getFiltered',
} as const;

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
