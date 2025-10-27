import { extend } from '@ingenyus/swarm';
import { z } from 'zod';
import { commonSchemas } from '../../common';
import { API_HTTP_METHODS } from '../../types';

const validHttpMethods = API_HTTP_METHODS.map((method) => `'${method}'`);

export const schema = z.object({
  method: extend(
    z
      .string()
      .min(1, 'HTTP method is required')
      .transform((val) => val.toUpperCase())
      .pipe(
        z.enum(API_HTTP_METHODS, {
          message: `Invalid HTTP method. Must be one of: ${validHttpMethods.join(', ')}`,
        })
      ),
    {
      description: 'The HTTP method used for this API Endpoint',
      friendlyName: 'HTTP Method',
      shortName: 'm',
      examples: validHttpMethods,
      helpText: `Must be one of: ${validHttpMethods.join(', ')}`,
    }
  ),
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  path: commonSchemas.path,
  entities: commonSchemas.entities,
  auth: commonSchemas.auth,
  force: commonSchemas.force,
  customMiddleware: extend(z.boolean().optional(), {
    description: 'Enable custom middleware for this API Endpoint',
    friendlyName: 'Custom Middleware',
    shortName: 'c',
    helpText: 'Will generate custom middleware file',
  }),
});
