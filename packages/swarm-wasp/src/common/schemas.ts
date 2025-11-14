import type { SchemaFieldMetadata } from '@ingenyus/swarm';
import { z } from 'zod/v4';

export const commonSchemas = {
  feature: z.string().min(1, 'Feature is required'),
  name: z.string().min(1, 'Name is required'),
  target: z.string().min(1, 'Target directory is required'),
  path: z.string().min(1, 'Path is required'),
  dataType: z.string().min(1, 'Data type is required'),
  entities: z.array(z.string()).optional(),
  force: z.boolean().optional(),
  auth: z.boolean().optional(),
} satisfies Record<string, z.ZodTypeAny>;

export const commonFieldMetadata: Record<string, SchemaFieldMetadata> = {
  feature: {
    type: 'string',
    required: true,
    description: 'The feature directory this component will be generated in',
    shortName: 'f',
    examples: ['root', 'auth', 'dashboard/users'],
    helpText:
      "Can be nested as a logical or relative path, e.g. 'dashboard/users' or 'features/dashboard/features/users'",
  },
  name: {
    type: 'string',
    required: true,
    description: 'The name of the generated component',
    shortName: 'n',
    examples: ['users', 'task'],
    helpText: 'Will be used for generated files and configuration entries',
  },
  target: {
    type: 'string',
    required: true,
    description: 'The target path of the generated directory',
    shortName: 't',
    examples: ['dashboard/users', 'features/dashboard/features/users'],
    helpText:
      "A logical or relative path, e.g. 'dashboard/users' or 'features/dashboard/features/users'",
  },
  path: {
    type: 'string',
    required: true,
    description: 'The path that this component will be accessible at',
    shortName: 'p',
    examples: ['/api/users/:id', '/api/products'],
    helpText: "Supports Express-style placeholders, e.g. '/api/users/:id'",
  },
  dataType: {
    type: 'string',
    required: true,
    description: 'The data type/model name for this operation',
    shortName: 'd',
    examples: ['User', 'Product', 'Task'],
    helpText: 'The Wasp entity or model name this operation will interact with',
  },
  entities: {
    type: 'array',
    required: false,
    description:
      'The Wasp entities that will be available to this component (optional)',
    shortName: 'e',
    examples: ['User', 'User Task'],
    helpText: 'An array of Wasp entity names',
    elementType: { type: 'string' },
  },
  force: {
    type: 'boolean',
    required: false,
    description:
      'Force overwrite of existing files and configuration entries (optional)',
    shortName: 'F',
    helpText:
      'CAUTION: Will overwrite existing files and configuration entries with current parameters',
  },
  auth: {
    type: 'boolean',
    required: false,
    description: 'Require authentication for this component (optional)',
    shortName: 'a',
    helpText: 'Will generate authentication checks',
  },
};
