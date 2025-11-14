import { registerSchemaMetadata } from '@ingenyus/swarm';
import { z } from 'zod/v4';
import {
  API_HTTP_METHODS,
  commonFieldMetadata,
  commonSchemas,
} from '../../common';

const validHttpMethods = API_HTTP_METHODS.map((method) => `${method}`);

const baseSchema = z.object({
  method: z
    .string()
    .min(1, 'HTTP method is required')
    .transform((val) => val.toUpperCase())
    .pipe(
      z.enum(API_HTTP_METHODS, {
        message: `Invalid HTTP method. Must be one of: ${validHttpMethods.join(', ')}`,
      })
    ),
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  path: commonSchemas.path,
  entities: commonSchemas.entities,
  auth: commonSchemas.auth,
  force: commonSchemas.force,
  customMiddleware: z.boolean().optional(),
});

export const schema = registerSchemaMetadata(baseSchema, {
  fields: {
    method: {
      type: 'enum',
      required: true,
      description: 'The HTTP method used for this API Endpoint',
      shortName: 'm',
      examples: validHttpMethods,
      helpText: `Must be one of: ${validHttpMethods.join(', ')}`,
      enumValues: validHttpMethods,
    },
    feature: commonFieldMetadata.feature,
    name: commonFieldMetadata.name,
    path: commonFieldMetadata.path,
    entities: commonFieldMetadata.entities,
    auth: commonFieldMetadata.auth,
    force: commonFieldMetadata.force,
    customMiddleware: {
      type: 'boolean',
      required: false,
      description: 'Enable custom middleware for this API Endpoint',
      shortName: 'c',
      helpText: 'Will generate custom middleware file',
    },
  },
});
