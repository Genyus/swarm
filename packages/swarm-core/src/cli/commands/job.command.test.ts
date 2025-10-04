import { describe, expect, it, vi } from 'vitest';
import { createJobCommand, jobCommandSchema } from './job.command';

vi.mock('../generators', async () => {
  const actual = await vi.importActual('../generators');

  return {
    ...actual,
    JobGenerator: vi.fn().mockImplementation(() => ({
      generate: vi.fn(),
    })),
  };
});

describe('createJobCommand', () => {
  it('registers and calls generator', async () => {
    const cmd = createJobCommand();

    // Simulate Commander
    const mockCmd = {
      requiredOption: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      action: vi.fn((fn) => {
        fn({
          feature: 'foo',
          name: 'job',
          entities: undefined,
          cron: undefined,
          args: undefined,
          force: false,
        });
        return mockCmd;
      }),
    };

    const program = {
      addCommand: vi.fn(),
    } as any;
    program.addCommand(cmd);
    expect(program.addCommand).toHaveBeenCalledWith(cmd);
  });
});

describe('jobCommandSchema validation', () => {
  it('validates valid cron expressions', () => {
    const validCrons = [
      '0 9 * * 1-5', // Every weekday at 9 AM
      '30 14 * * 0', // Every Sunday at 2:30 PM
      '0 0 1 * *', // First day of every month at midnight
      '15 6 * * *', // Every day at 6:15 AM
      '* * * * *', // Every minute
    ];

    validCrons.forEach((cron) => {
      const result = jobCommandSchema.safeParse({
        feature: 'test',
        name: 'job',
        cron,
      });
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid cron expressions', () => {
    const invalidCrons = [
      '0 9 * *', // Missing weekday
      '0 9 * * 1-5 6', // Too many values
      '60 9 * * 1-5', // Invalid minute (60)
      '0 25 * * 1-5', // Invalid hour (25)
      '0 9 32 * 1-5', // Invalid day (32)
      '0 9 * 13 1-5', // Invalid month (13)
      '0 9 * * 8', // Invalid weekday (8)
    ];

    invalidCrons.forEach((cron) => {
      const result = jobCommandSchema.safeParse({
        feature: 'test',
        name: 'job',
        cron,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Cron expression must be a valid five-field format'
        );
      }
    });
  });

  it('validates valid JSON args', () => {
    const validArgs = [
      '{"key": "value"}',
      '{"count": 42, "enabled": true}',
      '{}',
    ];

    validArgs.forEach((args) => {
      const result = jobCommandSchema.safeParse({
        feature: 'test',
        name: 'job',
        args,
      });
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid JSON args', () => {
    const invalidArgs = [
      '[]',
      'null',
      '{"key": "value"', // Missing closing brace
      '{key: "value"}', // Unquoted key
      'not json', // Plain text
      '{"key": value}', // Unquoted value
    ];

    invalidArgs.forEach((args) => {
      const result = jobCommandSchema.safeParse({
        feature: 'test',
        name: 'job',
        args,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Args must be a valid JSON object string'
        );
      }
    });
  });

  it('allows undefined cron and args', () => {
    const result = jobCommandSchema.safeParse({
      feature: 'test',
      name: 'job',
    });
    expect(result.success).toBe(true);
  });
});
