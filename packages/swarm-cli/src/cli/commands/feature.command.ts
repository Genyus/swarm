import {
  FeatureGenerator,
  IFeatureGenerator,
  IFileSystem,
  Logger,
  validateFeaturePath,
} from '@ingenyus/swarm-core';
import { Command } from 'commander';
import { FeatureGeneratorCommand } from '../../types/commands';
import { withPathOption } from '../options';

/**
 * Create a feature command
 * @param logger - The logger instance
 * @param fs - The file system instance
 * @returns The command
 */
export function createFeatureCommand(
  logger: Logger,
  fs: IFileSystem
): FeatureGeneratorCommand {
  return {
    name: 'feature',
    description: 'Generate a new feature',
    generator: new FeatureGenerator(logger, fs),
    register(program: Command, generator: IFeatureGenerator) {
      let cmd = program
        .command('feature')
        .description('Generate a new feature');
      cmd = withPathOption(cmd, 'Feature path');
      cmd.action(async (opts) => {
        validateFeaturePath(opts.path);
        generator.generateFeature(opts.path);
      });
    },
  };
}
