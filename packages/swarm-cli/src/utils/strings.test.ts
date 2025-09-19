import { describe, expect, it } from 'vitest';
import * as strings from './strings';

describe('strings utils', () => {
  it('toPascalCase converts separated patterns to PascalCase', () => {
    expect(strings.toPascalCase('foo-bar')).toBe('FooBar');
    expect(strings.toPascalCase('foo_bar')).toBe('FooBar');
    expect(strings.toPascalCase('foo bar')).toBe('FooBar');
    expect(strings.toPascalCase('FOO_BAR')).toBe('FooBar');
    expect(strings.toPascalCase('foo-bar-baz')).toBe('FooBarBaz');
    expect(strings.toPascalCase('foo_bar_baz')).toBe('FooBarBaz');
    expect(strings.toPascalCase('foo bar baz')).toBe('FooBarBaz');
    expect(strings.toPascalCase('FOO_BAR_BAZ')).toBe('FooBarBaz');
  });

  it('toPascalCase converts lowercase strings without separators by capitalising', () => {
    expect(strings.toPascalCase('foo')).toBe('Foo');
    expect(strings.toPascalCase('bar')).toBe('Bar');
    expect(strings.toPascalCase('foobarbaz')).toBe('Foobarbaz');
  });

  it('toPascalCase handles mixed cases without separators', () => {
    expect(strings.toPascalCase('FOO')).toBe('Foo');
    expect(strings.toPascalCase('HTML')).toBe('Html');
    expect(strings.toPascalCase('Bar')).toBe('Bar');
    expect(strings.toPascalCase('fooBarBaz')).toBe('FooBarBaz');
    expect(strings.toPascalCase('FooBarBaz')).toBe('FooBarBaz');
    expect(strings.toPascalCase('tEsT')).toBe('TEsT');
  });

  it('toPascalCase handles mixed cases with separators', () => {
    expect(strings.toPascalCase('FOO barBaz')).toBe('FooBarBaz');
    expect(strings.toPascalCase('fooBar baz')).toBe('FooBarBaz');
    expect(strings.toPascalCase('foo-barBaz')).toBe('FooBarBaz');
    expect(strings.toPascalCase('fooBar_baz')).toBe('FooBarBaz');
    expect(strings.toPascalCase('fooBar bazBar')).toBe('FooBarBazBar');
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
