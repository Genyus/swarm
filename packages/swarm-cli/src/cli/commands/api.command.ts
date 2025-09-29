import {
  ApiFlags,
  ApiGenerator,
  HttpMethod,
  validateFeaturePath,
} from '@ingenyus/swarm-core';
import { Command } from 'commander';
import { NodeGeneratorCommand } from '../../types/commands';
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
export function createApiCommand(): NodeGeneratorCommand<ApiFlags> {
  return {
    name: 'api',
    description: 'Generate an API endpoint',
    register(program: Command) {
      const generator = new ApiGenerator();
      let cmd = program
        .command('api')
        .requiredOption(
          '-m, --method <method>',
          'HTTP method (GET, POST, etc.)'
        )
        .description('Generate an API endpoint');

      cmd = withFeatureOption(cmd);
      cmd = withNameOption(cmd, 'API name');
      cmd = withPathOption(cmd, 'API path (e.g. /api/foo)');
      cmd = withEntitiesOption(cmd);
      cmd = withAuthOption(cmd);
      cmd = withForceOption(cmd);
      cmd = cmd.option(
        '-c, --custom-middleware',
        'Enable custom middleware for this API'
      );
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
          customMiddleware: !!opts.customMiddleware,
        });
      });
    },
  };
}
