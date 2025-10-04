import { Command } from 'commander';
import { z } from 'zod';
import { FeatureGenerator } from '../../generators/index';
import { validateFeaturePath } from '../../utils/strings';
import { CommandBuilder } from '../command-builder';
import { CommandFactory } from '../command-factory';
import { commonSchemas } from '../schemas';

const featureCommandSchema = z.object({
  path: commonSchemas.path,
});

export type FeatureCommandArgs = z.infer<typeof featureCommandSchema>;

/**
 * Create a feature command using the new CommandFactory system
 * @returns The command
 */
export function createFeatureCommand(): Command {
  const generator = new FeatureGenerator();

  return CommandFactory.createCommand<FeatureCommandArgs>({
    name: 'feature',
    description: 'Generate a new feature',
    schema: featureCommandSchema,
    handler: async (opts: FeatureCommandArgs) => {
      validateFeaturePath(opts.path);
      generator.generateFeature(opts.path);
    },
    optionBuilder: (builder: CommandBuilder) =>
      builder.withPath('Feature path').build(),
  });
}
