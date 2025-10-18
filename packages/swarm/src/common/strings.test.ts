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

  describe('hasHelperMethodCall', () => {
    it('detects single-line helper method calls', () => {
      const content =
        '.addApi("feature", "getUsers", { method: "GET", route: "/api/users" })';
      expect(strings.hasHelperMethodCall(content, 'addApi', 'getUsers')).toBe(
        true
      );
    });

    it('detects single-line calls with single quotes', () => {
      const content =
        ".addRoute('feature', 'MainRoute', { path: '/main', componentName: 'Main' })";
      expect(
        strings.hasHelperMethodCall(content, 'addRoute', 'MainRoute')
      ).toBe(true);
    });

    it('detects single-line calls with backticks', () => {
      const content =
        '.addAction(`feature`, `createUser`, { entities: ["User"] })';
      expect(
        strings.hasHelperMethodCall(content, 'addAction', 'createUser')
      ).toBe(true);
    });

    it('detects multi-line helper method calls', () => {
      const content = `
        .addApi(
          "feature",
          "getUsers",
          { method: "GET", route: "/api/users" }
        )
      `;
      expect(strings.hasHelperMethodCall(content, 'addApi', 'getUsers')).toBe(
        true
      );
    });

    it('detects multi-line calls with various indentation', () => {
      const content = `
        .addRoute(
            'feature',
            'MainRoute',
            { path: '/main', componentName: 'Main' }
        )
      `;
      expect(
        strings.hasHelperMethodCall(content, 'addRoute', 'MainRoute')
      ).toBe(true);
    });

    it('detects calls with extra whitespace', () => {
      const content =
        '.addApi( "feature" , "getUsers" , { method: "GET", route: "/api/users" } )';
      expect(strings.hasHelperMethodCall(content, 'addApi', 'getUsers')).toBe(
        true
      );
    });

    it('detects calls with newlines and whitespace', () => {
      const content =
        '.addApi(\n  "feature",\n  "getUsers",\n  { method: "GET", route: "/api/users" }\n)';
      expect(strings.hasHelperMethodCall(content, 'addApi', 'getUsers')).toBe(
        true
      );
    });

    it('returns false for non-matching method names', () => {
      const content =
        '.addApi("feature", "getUsers", { method: "GET", route: "/api/users" })';
      expect(strings.hasHelperMethodCall(content, 'addRoute', 'getUsers')).toBe(
        false
      );
    });

    it('returns false for non-matching object names', () => {
      const content =
        '.addApi("feature", "getUsers", { method: "GET", route: "/api/users" })';
      expect(strings.hasHelperMethodCall(content, 'addApi', 'getPosts')).toBe(
        false
      );
    });

    it('handles special regex characters in object names', () => {
      const content =
        '.addApi("feature", "get-users", { method: "GET", route: "/api/users" })';
      expect(strings.hasHelperMethodCall(content, 'addApi', 'get-users')).toBe(
        true
      );
    });

    it('handles object names with dots', () => {
      const content =
        '.addApi("feature", "api.v1.getUsers", { method: "GET", route: "/api/users" })';
      expect(
        strings.hasHelperMethodCall(content, 'addApi', 'api.v1.getUsers')
      ).toBe(true);
    });
  });

  describe('parseHelperMethodDefinition', () => {
    it('parses single-line definitions', () => {
      const definition =
        '.addApi("feature", "getUsers", { method: "GET", route: "/api/users" })';
      const result = strings.parseHelperMethodDefinition(definition);
      expect(result).toEqual({
        methodName: 'addApi',
        firstParam: 'getUsers',
      });
    });

    it('parses definitions with single quotes', () => {
      const definition =
        ".addRoute('feature', 'MainRoute', { path: '/main', componentName: 'Main' })";
      const result = strings.parseHelperMethodDefinition(definition);
      expect(result).toEqual({
        methodName: 'addRoute',
        firstParam: 'MainRoute',
      });
    });

    it('parses definitions with backticks', () => {
      const definition =
        '.addAction(`feature`, `createUser`, { entities: ["User"] })';
      const result = strings.parseHelperMethodDefinition(definition);
      expect(result).toEqual({
        methodName: 'addAction',
        firstParam: 'createUser',
      });
    });

    it('parses multi-line definitions', () => {
      const definition = `.addApi(
        "getUsers",
        "GET",
        "/api/users"
      )`;
      const result = strings.parseHelperMethodDefinition(definition);
      expect(result).toEqual({
        methodName: 'addApi',
        firstParam: 'getUsers',
      });
    });

    it('parses definitions with extra whitespace', () => {
      const definition =
        '.addApi( "feature" , "getUsers" , { method: "GET", route: "/api/users" } )';
      const result = strings.parseHelperMethodDefinition(definition);
      expect(result).toEqual({
        methodName: 'addApi',
        firstParam: 'getUsers',
      });
    });

    it('returns null for invalid definitions', () => {
      expect(strings.parseHelperMethodDefinition('')).toBe(null);
      expect(strings.parseHelperMethodDefinition('invalid')).toBe(null);
      expect(strings.parseHelperMethodDefinition('.addApi()')).toBe(null);
    });

    it('handles special characters in parameters', () => {
      const definition =
        '.addApi("feature", "get-users", { method: "GET", route: "/api/users" })';
      const result = strings.parseHelperMethodDefinition(definition);
      expect(result).toEqual({
        methodName: 'addApi',
        firstParam: 'get-users',
      });
    });
  });
});
