import { Command } from 'commander';
import { FeatureGenerator } from '../../generators/feature';
import { FeatureGeneratorCommand } from '../../types';
import { IFileSystem } from '../../types/filesystem';
import { IFeatureGenerator } from '../../types/generator';
import { Logger } from '../../types/logger';
import { validateFeaturePath } from '../../utils/strings';
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
