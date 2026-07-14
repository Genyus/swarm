import { beforeEach, describe, expect, it } from 'vitest';
import { createTestGenerator } from '../../../tests/utils';
import { ApiNamespaceGenerator } from './api-namespace-generator';
import { schema } from './schema';

describe('ApiNamespaceGenerator', () => {
  let gen: ApiNamespaceGenerator;

  beforeEach(async () => {
    gen = await createTestGenerator(ApiNamespaceGenerator, schema);
  });

  it('getDefinition builds a native apiNamespace declaration', () => {
    const decl = gen.getDefinition('bar', '/bar');

    expect(decl.kind).toBe('apiNamespace');
    expect(decl.call).toBe('apiNamespace("/bar", { middlewareConfigFn: bar })');
    expect(decl.refImports).toEqual([
      { names: ['bar'], from: './server/apis/middleware/bar' },
    ]);
  });
});
