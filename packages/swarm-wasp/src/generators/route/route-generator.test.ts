import { beforeEach, describe, expect, it } from 'vitest';
import { createTestGenerator } from '../../../tests/utils';
import { RouteGenerator } from './route-generator';
import { schema } from './schema';

describe('RouteGenerator', () => {
  let gen: RouteGenerator;

  beforeEach(async () => {
    gen = await createTestGenerator(RouteGenerator, schema);
  });

  it('getDefinition builds a native route declaration with an auth-protected page', () => {
    const decl = gen.getDefinition('dashboard', '/dashboard', true);

    expect(decl.kind).toBe('route');
    expect(decl.call).toBe(
      'route("dashboard", "/dashboard", page(Dashboard, { authRequired: true }))'
    );
    expect(decl.refImports).toEqual([
      { names: ['Dashboard'], from: './client/pages/Dashboard' },
    ]);
  });

  it('omits authRequired when auth is false', () => {
    const decl = gen.getDefinition('dashboard', '/dashboard', false);

    expect(decl.call).toBe('route("dashboard", "/dashboard", page(Dashboard))');
  });
});
