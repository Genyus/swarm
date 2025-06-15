import { Command } from 'commander';
import { ApiGenerator } from '../../generators/api';
import { ApiFlags, HttpMethod, NodeGeneratorCommand } from '../../types';
import { IFileSystem } from '../../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../../types/generator';
import { Logger } from '../../types/logger';
import { validateFeaturePath } from '../../utils/strings';
import {
  withAuthOption,
  withEntitiesOption,
  withFeatureOption,
  withForceOption,
  withNameOption,
  withPathOption,
} from '../options';

/**
 * Create an API command
 * @param logger - The logger instance
 * @param fs - The file system instance
 * @param featureGenerator - The feature generator instance
 * @returns The command
 */
export function createApiCommand(
  logger: Logger,
  fs: IFileSystem,
  featureGenerator: IFeatureGenerator
): NodeGeneratorCommand<ApiFlags> {
  return {
    name: 'api',
    description: 'Generate an API endpoint',
    generator: new ApiGenerator(logger, fs, featureGenerator),
    register(program: Command, generator: NodeGenerator<ApiFlags>) {
      let cmd = program
        .command('api')
        .requiredOption('--method <method>', 'HTTP method (GET, POST, etc.)')
        .description('Generate an API endpoint');
      cmd = withFeatureOption(cmd);
      cmd = withNameOption(cmd, 'API name');
      cmd = withPathOption(cmd, 'API path (e.g. /api/foo)');
      cmd = withEntitiesOption(cmd);
      cmd = withAuthOption(cmd);
      cmd = withForceOption(cmd);
      cmd.action(async (opts) => {
        validateFeaturePath(opts.feature);
        await generator.generate(opts.feature, {
          name: opts.name,
          method: opts.method.toUpperCase() as HttpMethod,
          route: opts.path,
          entities: opts.entities
            ? opts.entities
                .split(',')
                .map((e: string) => e.trim())
                .filter(Boolean)
            : undefined,
          auth: !!opts.auth,
          force: !!opts.force,
        });
      });
    },
  };
}
