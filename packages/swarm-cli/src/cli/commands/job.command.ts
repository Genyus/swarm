import {
  IFeatureGenerator,
  IFileSystem,
  JobGenerator,
  Logger,
  NodeGenerator,
  validateFeaturePath,
} from '@ingenyus/swarm-core';
import { Command } from 'commander';
import { NodeGeneratorCommand } from '../../types/commands';
import {
  withEntitiesOption,
  withFeatureOption,
  withForceOption,
  withNameOption,
} from '../options';

/**
 * Create a job command
 * @param logger - The logger instance
 * @param fs - The file system instance
 * @param featureGenerator - The feature generator instance
 * @returns The command
 */
export function createJobCommand(
  logger: Logger,
  fs: IFileSystem,
  featureGenerator: IFeatureGenerator
): NodeGeneratorCommand {
  return {
    name: 'job',
    description: 'Generate a job worker',
    generator: new JobGenerator(logger, fs, featureGenerator),
    register(program: Command, generator: NodeGenerator) {
      let cmd = program
        .command('job')
        .option('-s, --schedule <schedule>', 'Cron schedule')
        .option(
          '-a, --scheduleArgs <scheduleArgs>',
          'Schedule args (JSON string)'
        )
        .description('Generate a job worker');
      cmd = withFeatureOption(cmd);
      cmd = withNameOption(cmd, 'Job name');
      cmd = withEntitiesOption(cmd);
      cmd = withForceOption(cmd);
      cmd.action(async (opts) => {
        validateFeaturePath(opts.feature);
        await generator.generate(opts.feature, {
          name: opts.name,
          entities: opts.entities
            ? opts.entities
                .split(',')
                .map((e: string) => e.trim())
                .filter(Boolean)
            : undefined,
          schedule: opts.schedule,
          scheduleArgs: opts.scheduleArgs,
          force: !!opts.force,
        });
      });
    },
  };
}
