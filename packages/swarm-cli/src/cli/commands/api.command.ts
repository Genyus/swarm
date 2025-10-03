import {
  ApiGenerator,
  HTTP_METHODS,
  validateFeaturePath,
} from '@ingenyus/swarm-core';
import { Command } from 'commander';
import { z } from 'zod';
import { CommandBuilder } from '../command-builder';
import { CommandFactory } from '../command-factory';
import {
  commonSchemas,
  getTypedValueTransformer,
  getTypedValueValidator,
} from '../schemas';

const validHttpMethods = Object.values(HTTP_METHODS);

export const apiCommandSchema = z.object({
  method: z
    .string()
    .min(1, 'HTTP method is required')
    .refine(getTypedValueValidator(validHttpMethods), {
      message: `Invalid HTTP method. Must be one of: ${validHttpMethods.join(', ')}`,
    })
    .transform(getTypedValueTransformer(validHttpMethods)),
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  path: commonSchemas.path,
  entities: commonSchemas.entities,
  auth: commonSchemas.auth,
  force: commonSchemas.force,
  customMiddleware: z.boolean().optional(),
});

export type ApiCommandArgs = z.infer<typeof apiCommandSchema>;

/**
 * Create an API command using the new CommandFactory system
 * @returns The command
 */
export function createApiCommand(): Command {
  const generator = new ApiGenerator();
  const name = 'api';
  const description = 'Generate an API endpoint';

  return CommandFactory.createCommand<ApiCommandArgs>({
    name,
    description,
    schema: apiCommandSchema,
    handler: async (opts: ApiCommandArgs) => {
      validateFeaturePath(opts.feature);
      await generator.generate(opts.feature, {
        name: opts.name,
        method: opts.method,
        route: opts.path,
        entities: opts.entities,
        auth: !!opts.auth,
        force: !!opts.force,
        customMiddleware: !!opts.customMiddleware,
      });
    },
    optionBuilder: (builder: CommandBuilder) =>
      builder
        .withFeature()
        .withName('API name')
        .withPath('API path (e.g. /api/foo)')
        .withEntities()
        .withAuth()
        .withForce()
        .build()
        .requiredOption(
          '-m, --method <method>',
          'HTTP method (GET, POST, etc.)'
        )
        .option(
          '-c, --custom-middleware',
          'Enable custom middleware for this API'
        ),
  });
}
