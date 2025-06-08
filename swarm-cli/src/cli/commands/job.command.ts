import { Command } from 'commander';
import { JobGenerator } from '../../generators/job';
import { NodeGeneratorCommand } from '../../types';
import { IFileSystem } from '../../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../../types/generator';
import { Logger } from '../../types/logger';
import { validateFeaturePath } from '../../utils/strings';
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
        .option('--schedule <schedule>', 'Cron schedule')
        .option('--scheduleArgs <scheduleArgs>', 'Schedule args (JSON string)')
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
