import { RouteGenerator, validateFeaturePath } from '@ingenyus/swarm-core';
import { Command } from 'commander';
import { NodeGeneratorCommand } from '../../types/commands';
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
export function createRouteCommand(): NodeGeneratorCommand {
  return {
    name: 'route',
    description: 'Generate a route handler',
    register(program: Command) {
      const generator = new RouteGenerator();
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
