import { describe, expect, it } from 'vitest';
import * as strings from './strings';

describe('strings utils', () => {
  it('toPascalCase converts kebab to PascalCase', () => {
    expect(strings.toPascalCase('foo-bar')).toBe('FooBar');
  });

  it('getPlural pluralizes words', () => {
    expect(strings.getPlural('user')).toBe('users');
    expect(strings.getPlural('company')).toBe('companies');
  });

  it('validateFeaturePath returns segments', () => {
    expect(strings.validateFeaturePath('foo/bar')).toEqual(['foo', 'bar']);
  });

  // Add more tests for other string utilities as needed
}); 