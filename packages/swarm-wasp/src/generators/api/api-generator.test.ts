import { beforeEach, describe, expect, it } from 'vitest';
import { createTestGenerator } from '../../../tests/utils';
import { ApiGenerator } from './api-generator';
import { schema } from './schema';

describe('ApiGenerator', () => {
  let gen: ApiGenerator;

  beforeEach(async () => {
    gen = await createTestGenerator(ApiGenerator, schema);
  });

  it('getDefinition builds a native api declaration', () => {
    const decl = gen.getDefinition(
      'getFoo',
      'GET',
      '/foo',
      ['Task'],
      false,
      false
    );

    expect(decl.kind).toBe('api');
    expect(decl.call).toBe(
      'api("GET", "/foo", getFoo, { entities: ["Task"], auth: false })'
    );
    expect(decl.refImports).toEqual([
      { names: ['getFoo'], from: './server/apis/getFoo' },
    ]);
  });

  it('adds a distinctly-named middleware ref when customMiddleware is set', () => {
    const decl = gen.getDefinition('getFoo', 'POST', '/foo', [], true, true);

    expect(decl.call).toBe(
      'api("POST", "/foo", getFoo, { middlewareConfigFn: getFooMiddleware, auth: true })'
    );
    // The middleware export is suffixed to avoid colliding with the api handler.
    expect(decl.refImports).toEqual([
      { names: ['getFoo'], from: './server/apis/getFoo' },
      { names: ['getFooMiddleware'], from: './server/apis/middleware/getFoo' },
    ]);
  });
});
