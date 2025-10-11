import { extend } from '@ingenyus/swarm-core';
import { z } from 'zod';
import { HTTP_METHODS } from '../../types/constants';
import {
  commonSchemas,
  getTypedValueTransformer,
  getTypedValueValidator,
} from '../../common';

const validHttpMethods = Object.values(HTTP_METHODS);

export const schema = z.object({
  method: extend(
    z
      .string()
      .min(1, 'HTTP method is required')
      .refine(getTypedValueValidator(validHttpMethods), {
        message: `Invalid HTTP method. Must be one of: ${validHttpMethods.join(', ')}`,
      })
      .transform(getTypedValueTransformer(validHttpMethods)),
    {
      description: 'The HTTP method used for this API endpoint',
      friendlyName: 'HTTP Method',
      shortName: 'm',
      examples: validHttpMethods,
    }
  ),
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  path: commonSchemas.path,
  entities: commonSchemas.entities,
  auth: commonSchemas.auth,
  force: commonSchemas.force,
  customMiddleware: z.boolean().optional(),
});

type SchemaArgs = z.infer<typeof schema>;
