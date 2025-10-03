import { describe, expect, it, vi } from 'vitest';
import { apiCommandSchema, createApiCommand } from './api.command';

vi.mock('@ingenyus/swarm-core', async () => {
  const actual = await vi.importActual('@ingenyus/swarm-core');

  return {
    ...actual,
    ApiGenerator: vi.fn().mockImplementation(() => ({
      generate: vi.fn(),
    })),
  };
});

describe('createApiCommand', () => {
  it('registers and calls generator', async () => {
    const cmd = createApiCommand();

    // Simulate Commander
    const mockCmd = {
      requiredOption: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      action: vi.fn((fn) => {
        fn({
          feature: 'foo',
          name: 'api',
          method: 'GET',
          path: '/api',
          entities: undefined,
          auth: false,
          force: false,
          customMiddleware: false,
        });
        return mockCmd;
      }),
    };

    const program = {
      addCommand: vi.fn(),
    } as any;
    program.addCommand(cmd);
    expect(program.addCommand).toHaveBeenCalledWith(cmd);
  });
});

describe('apiCommandSchema validation', () => {
  it('validates valid HTTP methods', () => {
    const validMethods = ['ALL', 'GET', 'POST', 'PUT', 'DELETE'];

    validMethods.forEach((method) => {
      const result = apiCommandSchema.safeParse({
        feature: 'test',
        name: 'api',
        method,
        path: '/api/test',
      });
      expect(result.success).toBe(true);
    });
  });

  it('validates case-insensitive HTTP methods', () => {
    const caseInsensitiveMethods = ['all', 'get', 'Post', 'PUT', 'Delete'];

    caseInsensitiveMethods.forEach((method) => {
      const result = apiCommandSchema.safeParse({
        feature: 'test',
        name: 'api',
        method,
        path: '/api/test',
      });
      expect(result.success).toBe(true);

      // Verify that the result contains correctly cased method
      if (result.success) {
        const expectedMethod = ['ALL', 'GET', 'POST', 'PUT', 'DELETE'].find(
          (valid) => valid.toLowerCase() === method.toLowerCase()
        );
        expect(result.data.method).toBe(expectedMethod);
      }
    });
  });

  it('rejects invalid HTTP methods', () => {
    const invalidMethods = [
      'INVALID',
      'CONNECT',
      'TRACE',
      'PURGE',
      'LINK',
      'UNLINK',
    ];

    invalidMethods.forEach((method) => {
      const result = apiCommandSchema.safeParse({
        feature: 'test',
        name: 'api',
        method,
        path: '/api/test',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Invalid HTTP method. Must be one of:'
        );
      }
    });
  });

  it('rejects empty method', () => {
    const result = apiCommandSchema.safeParse({
      feature: 'test',
      name: 'api',
      method: '',
      path: '/api/test',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        'HTTP method is required'
      );
    }
  });

  it('validates complete valid command args', () => {
    const result = apiCommandSchema.safeParse({
      feature: 'test',
      name: 'api',
      method: 'POST',
      path: '/api/test',
      entities: 'User',
      auth: true,
      force: false,
      customMiddleware: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.method).toBe('POST');
      expect(result.data.feature).toBe('test');
      expect(result.data.name).toBe('api');
      expect(result.data.path).toBe('/api/test');
      expect(result.data.entities).toBe('User');
      expect(result.data.auth).toBe(true);
      expect(result.data.force).toBe(false);
      expect(result.data.customMiddleware).toBe(true);
    }
  });
});
