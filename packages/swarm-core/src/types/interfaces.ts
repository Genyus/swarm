import {
  ActionOperation,
  CrudOperation,
  HttpMethod,
  QueryOperation,
} from './constants.js';

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
  public?: CrudOperation[];
  /** Override operations (for CRUD) */
  override?: CrudOperation[];
  /** Exclude operations (for CRUD) */
  exclude?: CrudOperation[];
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
 * Represents a configuration entry for an operation.
 */
export interface OperationConfigEntry {
  operationName: string;
  entities: string[];
  authRequired: boolean;
}
