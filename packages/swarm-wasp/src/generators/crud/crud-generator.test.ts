import { beforeEach, describe, expect, it } from 'vitest';
import { createTestGenerator } from '../../../tests/utils';
import { CrudGenerator } from './crud-generator';
import { schema } from './schema';

describe('CrudGenerator', () => {
  let gen: CrudGenerator;

  beforeEach(async () => {
    gen = await createTestGenerator(CrudGenerator, schema);
  });

  it('getDefinition builds a native crud declaration with public, override, and excluded ops', () => {
    const decl = gen.getDefinition('tasks', 'Task', {
      dataType: 'Task',
      feature: 'todo',
      public: ['get', 'getAll'],
      override: ['create'],
      exclude: ['delete'],
    });

    expect(decl.kind).toBe('crud');
    // The crud is declared with a PascalCase name matching the generated type.
    expect(decl.call).toBe(
      'crud("Tasks", "Task", { get: { isPublic: true }, getAll: { isPublic: true }, create: { overrideFn: createTask }, update: {} })'
    );
    // Override fn is imported from the single generated crud file.
    expect(decl.refImports).toEqual([
      { names: ['createTask'], from: './server/cruds/tasks' },
    ]);
  });

  it('enables all operations by default with no ref imports', () => {
    const decl = gen.getDefinition('tasks', 'Task', {
      dataType: 'Task',
      feature: 'todo',
    });

    expect(decl.call).toBe(
      'crud("Tasks", "Task", { get: {}, getAll: {}, create: {}, update: {}, delete: {} })'
    );
    expect(decl.refImports).toEqual([]);
  });
});
