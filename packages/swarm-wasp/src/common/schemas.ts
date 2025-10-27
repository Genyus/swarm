import { extend } from '@ingenyus/swarm';
import { z } from 'zod';

/**
 * Common Zod schemas shared across Wasp generators
 * These provide consistent validation rules for common generator arguments
 */
export const commonSchemas = {
  feature: extend(z.string().min(1, 'Feature is required'), {
    description: 'The feature directory this component will be generated in',
    friendlyName: 'Feature',
    shortName: 'f',
    examples: ["'root'", "'auth'", "'dashboard/users'"],
    helpText:
      'Can be nested as a logical or relative path, e.g. "dashboard/users" or "features/dashboard/features/users"',
  }),
  name: extend(z.string().min(1, 'Name is required'), {
    description: 'The name of the generated component',
    friendlyName: 'Name',
    shortName: 'n',
    examples: ["'users'", "'task'"],
    helpText: 'Will be used for generated files and configuration entries',
  }),
  target: extend(z.string().min(1, 'Target directory is required'), {
    description: 'The target path of the generated directory',
    friendlyName: 'Target Directory',
    shortName: 't',
    examples: ["'dashboard/users'", "'features/dashboard/features/users'"],
    helpText:
      'A logical or relative path, e.g. "dashboard/users" or "features/dashboard/features/users"',
  }),
  path: extend(z.string().min(1, 'Path is required'), {
    description: 'The path that this component will be accessible at',
    friendlyName: 'Path',
    shortName: 'p',
    examples: ["'/api/users/:id'", "'/api/products'"],
    helpText: 'Supports Express-style placeholders, e.g. "/api/users/:id"',
  }),
  entities: extend(z.array(z.string()).optional(), {
    description:
      'The Wasp entities that will be available to this component (optional)',
    friendlyName: 'Entities',
    shortName: 'e',
    examples: ["'User'", "'User' 'Task'"],
    helpText: 'An array of Wasp entity names',
  }),
  force: extend(z.boolean().optional(), {
    description:
      'Force overwrite of existing files and configuration entries (optional)',
    friendlyName: 'Force',
    shortName: 'F',
    helpText:
      'CAUTION: Will overwrite existing files and configuration entries with current parameters',
  }),
  auth: extend(z.boolean().optional(), {
    description: 'Require authentication for this component (optional)',
    friendlyName: 'Auth',
    shortName: 'a',
    helpText: 'Will generate authentication checks',
  }),
  dataType: extend(z.string().min(1, 'Data type is required'), {
    description: 'The data type/model name for this operation',
    friendlyName: 'Data Type',
    shortName: 'd',
    examples: ["'User'", "'Product'", "'Task'"],
    helpText: 'The Wasp entity or model name this operation will interact with',
  }),
} satisfies Record<string, z.ZodTypeAny>;
