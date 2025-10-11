import { extend } from '@ingenyus/swarm-core';
import { z } from 'zod';
import { commonSchemas } from '../../utils/schemas';

const cronSchema = extend(
  z
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
  {
    description: 'Cron schedule expression for the job',
    friendlyName: 'Cron Schedule',
    shortName: 'c',
    examples: ['0 9 * * *', '*/15 * * * *', '0 0 1 * *'],
    helpText: 'Five-field cron expression: minute hour day month weekday',
  }
);
const argsSchema = extend(
  z
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
  {
    description: 'Arguments to pass to the job function when executed',
    friendlyName: 'Job Arguments',
    shortName: 'a',
    examples: ['{"userId": 123}', '{"type": "cleanup", "batchSize": 100}'],
    helpText: 'JSON object string that will be passed to the job function',
  }
);

export const schema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  entities: commonSchemas.entities,
  cron: cronSchema,
  args: argsSchema,
  force: commonSchemas.force,
});

type SchemaArgs = z.infer<typeof schema>;
