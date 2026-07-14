import { beforeEach, describe, expect, it } from 'vitest';
import { createTestGenerator } from '../../../tests/utils';
import { ActionGenerator } from './action-generator';
import { schema } from './schema';

describe('ActionGenerator', () => {
  let gen: ActionGenerator;

  beforeEach(async () => {
    gen = await createTestGenerator(ActionGenerator, schema);
  });

  it('getOperationDefinition builds a native action declaration', () => {
    const decl = gen.getOperationDefinition(
      'createTask',
      ['Task'],
      'action',
      true
    );

    expect(decl.kind).toBe('action');
    expect(decl.call).toBe(
      'action(createTask, { entities: ["Task"], auth: true })'
    );
    expect(decl.refImports).toEqual([
      { names: ['createTask'], from: './server/actions/createTask' },
    ]);
  });

  it('omits entities when none are given', () => {
    const decl = gen.getOperationDefinition('doThing', [], 'action', false);

    expect(decl.call).toBe('action(doThing, { auth: false })');
  });
});
