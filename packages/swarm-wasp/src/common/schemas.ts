import { commandRegistry } from '@ingenyus/swarm';
import { z } from 'zod';

/**
 * Common Zod schemas shared across Wasp generators
 * These provide consistent validation rules for common generator arguments
 */
export const commonSchemas = {
  feature: z
    .string()
    .min(1, 'Feature is required')
    .meta({
      description: 'The feature directory this component will be generated in',
    })
    .register(commandRegistry, {
      shortName: 'f',
      examples: ["'root'", "'auth'", "'dashboard/users'"],
      helpText:
        'Can be nested as a logical or relative path, e.g. "dashboard/users" or "features/dashboard/features/users"',
    }),
  name: z
    .string()
    .min(1, 'Name is required')
    .meta({ description: 'The name of the generated component' })
    .register(commandRegistry, {
      shortName: 'n',
      examples: ["'users'", "'task'"],
      helpText: 'Will be used for generated files and configuration entries',
    }),
  target: z
    .string()
    .min(1, 'Target directory is required')
    .meta({ description: 'The target path of the generated directory' })
    .register(commandRegistry, {
      shortName: 't',
      examples: ["'dashboard/users'", "'features/dashboard/features/users'"],
      helpText:
        'A logical or relative path, e.g. "dashboard/users" or "features/dashboard/features/users"',
    }),
  path: z
    .string()
    .min(1, 'Path is required')
    .meta({ description: 'The path that this component will be accessible at' })
    .register(commandRegistry, {
      shortName: 'p',
      examples: ["'/api/users/:id'", "'/api/products'"],
      helpText: 'Supports Express-style placeholders, e.g. "/api/users/:id"',
    }),
  entities: z
    .array(z.string())
    .optional()
    .meta({
      description:
        'The Wasp entities that will be available to this component (optional)',
    })
    .register(commandRegistry, {
      shortName: 'e',
      examples: ["'User'", "'User' 'Task'"],
      helpText: 'An array of Wasp entity names',
    }),
  force: z
    .boolean()
    .optional()
    .meta({
      description:
        'Force overwrite of existing files and configuration entries (optional)',
    })
    .register(commandRegistry, {
      shortName: 'F',
      helpText:
        'CAUTION: Will overwrite existing files and configuration entries with current parameters',
    }),
  auth: z
    .boolean()
    .optional()
    .meta({
      description: 'Require authentication for this component (optional)',
    })
    .register(commandRegistry, {
      shortName: 'a',
      helpText: 'Will generate authentication checks',
    }),
  dataType: z
    .string()
    .min(1, 'Data type is required')
    .meta({ description: 'The data type/model name for this operation' })
    .register(commandRegistry, {
      shortName: 'd',
      examples: ["'User'", "'Product'", "'Task'"],
      helpText:
        'The Wasp entity or model name this operation will interact with',
    }),
} satisfies Record<string, z.ZodTypeAny>;
