import { beforeEach, describe, expect, it } from 'vitest';
import { createTestGenerator } from '../../../tests/utils';
import { QueryGenerator } from './query-generator';
import { schema } from './schema';

describe('QueryGenerator', () => {
  let gen: QueryGenerator;

  beforeEach(async () => {
    gen = await createTestGenerator(QueryGenerator, schema);
  });

  it('getOperationDefinition builds a native query declaration', () => {
    const decl = gen.getOperationDefinition(
      'getTask',
      ['Task'],
      'query',
      false
    );

    expect(decl.kind).toBe('query');
    expect(decl.call).toBe(
      'query(getTask, { entities: ["Task"], auth: false })'
    );
    expect(decl.refImports).toEqual([
      { names: ['getTask'], from: './server/queries/getTask' },
    ]);
  });

  it('includes multiple entities in declaration order', () => {
    const decl = gen.getOperationDefinition(
      'getTasks',
      ['Task', 'Tag'],
      'query',
      true
    );

    expect(decl.call).toBe(
      'query(getTasks, { entities: ["Task", "Tag"], auth: true })'
    );
  });
});
