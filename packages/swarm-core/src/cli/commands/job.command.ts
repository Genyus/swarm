import { Command } from 'commander';
import { z } from 'zod';
import { JobGenerator } from '../../generators/index';
import { validateFeaturePath } from '../../utils/strings';
import { CommandBuilder } from '../command-builder';
import { CommandFactory } from '../command-factory';
import { commonSchemas } from '../schemas';

export const jobCommandSchema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  entities: commonSchemas.entities,
  cron: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;

        // Split into 5 parts
        const parts = val.trim().split(/\s+/);

        if (parts.length !== 5) return false;

        const [minute, hour, day, month, weekday] = parts;
        const validateCronField = (
          field: string,
          min: number,
          max: number
        ): boolean => {
          if (field === '*') return true;

          // Handle ranges, lists, and steps
          const rangeRegex = /^(\d+)(-(\d+))?(,(\d+)(-(\d+))?)*(\/(\d+))?$/;

          if (!rangeRegex.test(field)) return false;

          const items = field.split(',');

          for (const item of items) {
            if (item.includes('/')) {
              // Handle step values like */15
              const [base, step] = item.split('/');
              const stepNum = parseInt(step, 10);

              if (isNaN(stepNum) || stepNum <= 0) return false;

              if (base === '*') continue; // */15 is valid

              const baseNum = parseInt(base, 10);

              if (isNaN(baseNum) || baseNum < min || baseNum > max)
                return false;
            } else if (item.includes('-')) {
              // Handle ranges like 1-5
              const [start, end] = item.split('-');
              const startNum = parseInt(start, 10);
              const endNum = parseInt(end, 10);

              if (
                isNaN(startNum) ||
                isNaN(endNum) ||
                startNum < min ||
                endNum > max ||
                startNum > endNum
              )
                return false;
            } else {
              // Handle single values
              const num = parseInt(item, 10);

              if (isNaN(num) || num < min || num > max) return false;
            }
          }

          return true;
        };

        return (
          validateCronField(minute, 0, 59) &&
          validateCronField(hour, 0, 23) &&
          validateCronField(day, 1, 31) &&
          validateCronField(month, 1, 12) &&
          validateCronField(weekday, 0, 6)
        );
      },
      {
        message:
          'Cron expression must be a valid five-field format: (minute hour day month weekday), e.g. "0 9 * * *"',
      }
    ),
  args: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;

        try {
          const parsed = JSON.parse(val);

          return (
            typeof parsed === 'object' &&
            parsed !== null &&
            !Array.isArray(parsed)
          );
        } catch {
          return false;
        }
      },
      {
        message: 'Args must be a valid JSON object string',
      }
    ),
  force: commonSchemas.force,
});

export type JobCommandArgs = z.infer<typeof jobCommandSchema>;

/**
 * Create a job command using the new CommandFactory system
 * @returns The command
 */
export function createJobCommand(): Command {
  const generator = new JobGenerator();
  const name = 'job';
  const description = 'Generate a job worker';

  return CommandFactory.createCommand<JobCommandArgs>({
    name,
    description,
    schema: jobCommandSchema,
    handler: async (opts: JobCommandArgs) => {
      validateFeaturePath(opts.feature);
      await generator.generate(opts.feature, {
        name: opts.name,
        entities: opts.entities,
        cron: opts.cron,
        args: opts.args,
        force: !!opts.force,
      });
    },
    optionBuilder: (builder: CommandBuilder) =>
      builder
        .withFeature()
        .withName('Job name')
        .withEntities()
        .withForce()
        .build()
        .option(
          '-c, --cron <cron>',
          'A five-field cron expression (minute hour day month weekday), e.g. "0 9 * * *"'
        )
        .option(
          '-a, --args <args>',
          'The arguments to pass to the `perform.fn` function when invoked (must be a valid JSON object)'
        ),
  });
}
