import { Command } from 'commander';
import { RouteGenerator } from '../../generators/route';
import { NodeGeneratorCommand } from '../../types';
import { IFileSystem } from '../../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../../types/generator';
import { Logger } from '../../types/logger';
import { validateFeaturePath } from '../../utils/strings';
import {
  withAuthOption,
  withFeatureOption,
  withForceOption,
  withNameOption,
  withPathOption,
} from '../options';

/**
 * Create a route command
 * @param logger - The logger instance
 * @param fs - The file system instance
 * @returns The command
 */
export function createRouteCommand(
  logger: Logger,
  fs: IFileSystem,
  featureGenerator: IFeatureGenerator
): NodeGeneratorCommand {
  return {
    name: 'route',
    description: 'Generate a route handler',
    generator: new RouteGenerator(logger, fs, featureGenerator),
    register(program: Command, generator: NodeGenerator) {
      let cmd = program.command(this.name).description(this.description);
      cmd = withFeatureOption(cmd);
      cmd = withNameOption(cmd, 'Route name');
      cmd = withPathOption(cmd, 'Route path (e.g. /foo)');
      cmd = withAuthOption(cmd);
      cmd = withForceOption(cmd);
      cmd.action(async (opts) => {
        validateFeaturePath(opts.feature);
        await generator.generate(opts.feature, {
          name: opts.name,
          path: opts.path,
          force: !!opts.force,
        });
      });
    },
  };
}
