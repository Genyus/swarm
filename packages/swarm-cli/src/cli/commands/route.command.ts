import { RouteGenerator, validateFeaturePath } from '@ingenyus/swarm-core';
import { Command } from 'commander';
import { z } from 'zod';
import { CommandBuilder } from '../command-builder';
import { CommandFactory } from '../command-factory';
import { commonSchemas } from '../schemas';

const routeCommandSchema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  path: commonSchemas.path,
  auth: commonSchemas.auth,
  force: commonSchemas.force,
});

export type RouteCommandArgs = z.infer<typeof routeCommandSchema>;

/**
 * Create a route command using the new CommandFactory system
 * @returns The command
 */
export function createRouteCommand(): Command {
  const generator = new RouteGenerator();
  const name = 'route';
  const description = 'Generate a route handler';

  return CommandFactory.createCommand<RouteCommandArgs>({
    name,
    description,
    schema: routeCommandSchema,
    handler: async (opts: RouteCommandArgs) => {
      validateFeaturePath(opts.feature);
      await generator.generate(opts.feature, {
        name: opts.name,
        path: opts.path,
        force: !!opts.force,
      });
    },
    optionBuilder: (builder: CommandBuilder) =>
      builder
        .withFeature()
        .withName('Route name')
        .withPath('Route path (e.g. /foo)')
        .withAuth()
        .withForce()
        .build(),
  });
}
