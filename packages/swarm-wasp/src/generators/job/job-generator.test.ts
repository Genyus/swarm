import { beforeEach, describe, expect, it } from 'vitest';
import { createTestGenerator } from '../../../tests/utils';
import { JobGenerator } from './job-generator';
import { schema } from './schema';

describe('JobGenerator', () => {
  let gen: JobGenerator;

  beforeEach(async () => {
    gen = await createTestGenerator(JobGenerator, schema);
  });

  it('getDefinition builds a native job declaration with a schedule', () => {
    const decl = gen.getDefinition('cleanup', ['Task'], '0 0 * * *', '{}');

    expect(decl.kind).toBe('job');
    expect(decl.call).toBe(
      'job(cleanup, { executor: "PgBoss", entities: ["Task"], schedule: { cron: "0 0 * * *" } })'
    );
    expect(decl.refImports).toEqual([
      { names: ['cleanup'], from: './server/jobs/cleanup' },
    ]);
  });

  it('omits schedule when no cron is given and includes schedule args when provided', () => {
    expect(gen.getDefinition('cleanup', [], '', '{}').call).toBe(
      'job(cleanup, { executor: "PgBoss" })'
    );

    expect(
      gen.getDefinition('cleanup', [], '0 0 * * *', '{ limit: 10 }').call
    ).toBe(
      'job(cleanup, { executor: "PgBoss", schedule: { cron: "0 0 * * *", args: { limit: 10 } } })'
    );
  });
});
