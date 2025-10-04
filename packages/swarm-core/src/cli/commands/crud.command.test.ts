import { describe, expect, it, vi } from 'vitest';
import {
  createCrudCommand,
  crudCommandSchema,
  crudOperationsArray,
} from './crud.command';

vi.mock('../generators', async () => {
  const actual = await vi.importActual('../generators');

  return {
    ...actual,
    CrudGenerator: vi.fn().mockImplementation(() => ({
      generate: vi.fn(),
    })),
  };
});

describe('createCrudCommand', () => {
  it('registers and calls generator', async () => {
    const cmd = createCrudCommand();

    // Simulate Commander
    const mockCmd = {
      requiredOption: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      action: vi.fn((fn) => {
        fn({
          feature: 'foo',
          name: 'User',
          public: undefined,
          override: undefined,
          exclude: undefined,
          force: false,
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

describe('crudOperationsArray validation', () => {
  it('validates valid CRUD operations', () => {
    const validOperations = [
      'create',
      'get',
      'getAll',
      'update',
      'delete',
      'create,get',
      'create,getAll,update,delete',
      'get, update, delete', // with spaces
    ];

    validOperations.forEach((operations) => {
      const result = crudOperationsArray.safeParse(operations);
      expect(result.success).toBe(true);
    });
  });

  it('validates case-insensitive CRUD operations', () => {
    const caseInsensitiveOperations = [
      'CREATE',
      'Get',
      'GETALL',
      'Update',
      'DELETE',
      'Create,Get',
      'CREATE,getAll,UPDATE,delete',
      'GET, Update, DELETE', // with spaces
    ];

    caseInsensitiveOperations.forEach((operations) => {
      const result = crudOperationsArray.safeParse(operations);
      expect(result.success).toBe(true);

      // Verify that the result contains correctly cased operations
      if (result.success) {
        const expectedOperations = operations
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((op) => {
            const validOperations = [
              'create',
              'get',
              'getAll',
              'update',
              'delete',
            ];
            return validOperations.find(
              (valid) => valid.toLowerCase() === op.toLowerCase()
            );
          });
        expect(result.data).toEqual(expectedOperations);
      }
    });
  });

  it('rejects invalid CRUD operations', () => {
    const invalidOperations = [
      'invalid',
      'create,invalid',
      'get,invalid,update',
      'create,list', // 'list' is not a valid CRUD operation
      'read,write', // neither are valid
    ];

    invalidOperations.forEach((operations) => {
      const result = crudOperationsArray.safeParse(operations);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Must be one or more of:'
        );
        expect(result.error.issues[0].message).toContain(
          'create, get, getAll, update, delete'
        );
      }
    });
  });

  it('allows undefined operations', () => {
    const result = crudOperationsArray.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it('handles empty string', () => {
    const result = crudOperationsArray.safeParse('');
    expect(result.success).toBe(true);
  });
});

describe('crudCommandSchema validation', () => {
  it('validates complete valid command args', () => {
    const result = crudCommandSchema.safeParse({
      feature: 'test',
      name: 'User',
      public: 'create,get',
      override: 'update',
      exclude: 'delete',
      force: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid operations in any field', () => {
    const result = crudCommandSchema.safeParse({
      feature: 'test',
      name: 'User',
      public: 'create,invalid',
      override: 'update',
      exclude: 'delete',
      force: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        'Must be one or more of'
      );
    }
  });

  it('validates case-insensitive operations in command schema', () => {
    const result = crudCommandSchema.safeParse({
      feature: 'test',
      name: 'User',
      public: 'CREATE,GET',
      override: 'UPDATE',
      exclude: 'DELETE',
      force: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.public).toEqual(['create', 'get']);
      expect(result.data.override).toEqual(['update']);
      expect(result.data.exclude).toEqual(['delete']);
    }
  });
});
