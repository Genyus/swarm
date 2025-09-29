import {
  ApiNamespaceGenerator,
  validateFeaturePath,
} from '@ingenyus/swarm-core';
import { Command } from 'commander';
import { NodeGeneratorCommand } from '../../types/commands';
import {
  withFeatureOption,
  withForceOption,
  withNameOption,
  withPathOption,
} from '../options';

export function createApiNamespaceCommand(): NodeGeneratorCommand {
  return {
    name: 'apinamespace',
    description: 'Generate an API namespace',
    register(program: Command) {
      const generator = new ApiNamespaceGenerator();
      let cmd = program
        .command('apinamespace')
        .description('Generate an API namespace');

      cmd = withFeatureOption(cmd);
      cmd = withNameOption(cmd, 'Namespace name');
      cmd = withPathOption(cmd);
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
