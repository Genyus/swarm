import { Command } from 'commander';
import { z } from 'zod';
import { ApiNamespaceGenerator } from '../../generators/index';
import { validateFeaturePath } from '../../utils/strings';
import { CommandBuilder } from '../command-builder';
import { CommandFactory } from '../command-factory';
import { commonSchemas } from '../schemas';

const apiNamespaceCommandSchema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  path: commonSchemas.path,
  force: commonSchemas.force,
});

export type ApiNamespaceCommandArgs = z.infer<typeof apiNamespaceCommandSchema>;

/**
 * Create an API namespace command using the new CommandFactory system
 * @returns The command
 */
export function createApiNamespaceCommand(): Command {
  const generator = new ApiNamespaceGenerator();
  const name = 'api-namespace';
  const description = 'Generate an API namespace';

  return CommandFactory.createCommand<ApiNamespaceCommandArgs>({
    name,
    description,
    schema: apiNamespaceCommandSchema,
    handler: async (opts: ApiNamespaceCommandArgs) => {
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
        .withName('Namespace name')
        .withPath()
        .withForce()
        .build(),
  });
}
