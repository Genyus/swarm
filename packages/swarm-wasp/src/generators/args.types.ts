import {
  ActionOperation,
  CrudOperation,
  HttpMethod,
  QueryOperation,
} from '../types';

/**
 * Common flags used across different generators
 * @interface CommonGeneratorFlags
 */
interface CommonGeneratorFlags {
  /** Feature path/name */
  feature: string;
  /** Resource name (API, Job, Route, etc.) */
  name: string;
  /** Data type/model name */
  dataType: string;
  /** Operation type (for queries/actions) */
  operation: ActionOperation | QueryOperation;
  /** HTTP method (for APIs) */
  method: HttpMethod;
  /** Route/API path */
  path: string;
  /** Route path (alias for path) */
  route: string;
  /** Entities to include */
  entities?: string | string[];
  /** Force overwrite existing files */
  force?: boolean;
  /** Require authentication */
  auth?: boolean;
  /** Cron schedule (for jobs) */
  cron?: string;
  /** Schedule arguments (for jobs) */
  args?: string;
  /** Public operations (for CRUD) */
  public?: CrudOperation[];
  /** Override operations (for CRUD) */
  override?: CrudOperation[];
  /** Exclude operations (for CRUD) */
  exclude?: CrudOperation[];
  /** Enable custom middleware for API definitions */
  customMiddleware?: boolean;
}

/**
 * Operation-specific flags
 */
export type OperationFlags = Pick<
  CommonGeneratorFlags,
  'feature' | 'entities' | 'force' | 'auth' | 'operation' | 'dataType'
>;

/**
 * Action-specific flags
 */
export type ActionFlags = Pick<
  CommonGeneratorFlags,
  'feature' | 'entities' | 'force' | 'auth' | 'dataType'
> & {
  operation: ActionOperation;
};

/**
 * Query-specific flags
 */
export type QueryFlags = Pick<
  CommonGeneratorFlags,
  'feature' | 'entities' | 'force' | 'auth' | 'dataType'
> & {
  operation: QueryOperation;
};

/**
 * API-specific flags
 */
export type ApiFlags = Pick<
  CommonGeneratorFlags,
  | 'feature'
  | 'name'
  | 'method'
  | 'route'
  | 'force'
  | 'entities'
  | 'auth'
  | 'customMiddleware'
>;

/**
 * Job-specific flags
 */
export type JobFlags = Pick<
  CommonGeneratorFlags,
  'feature' | 'name' | 'entities' | 'cron' | 'args' | 'force'
>;

/**
 * Route-specific flags
 */
export type RouteFlags = Pick<
  CommonGeneratorFlags,
  'feature' | 'name' | 'force' | 'auth' | 'path'
>;

/**
 * CRUD-specific flags
 */
export type CrudFlags = Pick<
  CommonGeneratorFlags,
  'feature' | 'public' | 'override' | 'exclude' | 'force' | 'dataType' | 'auth'
>;

/**
 * ApiNamespace-specific flags
 */
export type ApiNamespaceFlags = Pick<
  CommonGeneratorFlags,
  'feature' | 'name' | 'path' | 'force'
>;

/**
 * Represents a configuration entry for an operation.
 */
export interface OperationConfigEntry {
  operationName: string;
  entities: string[];
  authRequired: boolean;
}
