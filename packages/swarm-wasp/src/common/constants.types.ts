/**
 * Type definitions for constants.
 * These types are derived from the constants in constants.ts.
 */

import {
  ACTION_OPERATIONS,
  API_HTTP_METHODS,
  CONFIG_TYPES,
  CRUD_OPERATIONS,
  OPERATION_TYPES,
  QUERY_OPERATIONS,
} from './constants';

/**
 * Type for valid operation types.
 */
export type OperationType = (typeof OPERATION_TYPES)[number];

/**
 * Type for valid API HTTP method values.
 */
export type ApiHttpMethod = (typeof API_HTTP_METHODS)[number];

/**
 * Type for valid CRUD operation values.
 */
export type CrudOperation =
  (typeof CRUD_OPERATIONS)[keyof typeof CRUD_OPERATIONS];

/**
 * Type for valid action operation values.
 */
export type ActionOperation =
  (typeof ACTION_OPERATIONS)[keyof typeof ACTION_OPERATIONS];

/**
 * Type for valid query operation values.
 */
export type QueryOperation =
  (typeof QUERY_OPERATIONS)[keyof typeof QUERY_OPERATIONS];

/**
 * Type for valid config type values.
 */
export type ConfigType = (typeof CONFIG_TYPES)[keyof typeof CONFIG_TYPES];
