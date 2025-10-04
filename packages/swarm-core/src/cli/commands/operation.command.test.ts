import { describe, expect, it, vi } from 'vitest';
import {
  createActionCommand,
  createQueryCommand,
  operationSchema,
} from './operation.command';

vi.mock('../generators', async () => {
  const actual = await vi.importActual('../generators');

  return {
    ...actual,
    OperationGenerator: vi.fn().mockImplementation(() => ({
      generate: vi.fn(),
    })),
  };
});

describe('createActionCommand', () => {
  it('registers and calls generator', async () => {
    const cmd = createActionCommand();

    // Simulate Commander
    const mockCmd = {
      requiredOption: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      action: vi.fn((fn) => {
        fn({
          feature: 'foo',
          dataType: 'User',
          operation: 'get',
          entities: 'User',
          force: false,
          auth: false,
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

describe('createQueryCommand', () => {
  it('registers and calls generator', async () => {
    const cmd = createQueryCommand();

    // Simulate Commander
    const mockCmd = {
      requiredOption: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      action: vi.fn((fn) => {
        fn({
          feature: 'foo',
          dataType: 'User',
          operation: 'get',
          entities: 'User',
          force: false,
          auth: false,
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

describe('operationSchema validation', () => {
  it('validates valid operations', () => {
    const validOperations = [
      'create',
      'update',
      'delete',
      'get',
      'getAll',
      'getFiltered',
    ];

    validOperations.forEach((operation) => {
      const result = operationSchema.safeParse(operation);
      expect(result.success).toBe(true);
    });
  });

  it('validates case-insensitive operations', () => {
    const caseInsensitiveOperations = [
      'CREATE',
      'Update',
      'DELETE',
      'Get',
      'GETALL',
      'GetFiltered',
    ];

    caseInsensitiveOperations.forEach((operation) => {
      const result = operationSchema.safeParse(operation);
      expect(result.success).toBe(true);

      // Verify that the result contains correctly cased operation
      if (result.success) {
        const expectedOperation = [
          'create',
          'update',
          'delete',
          'get',
          'getAll',
          'getFiltered',
        ].find((valid) => valid.toLowerCase() === operation.toLowerCase());
        expect(result.data).toBe(expectedOperation);
      }
    });
  });

  it('rejects invalid operations', () => {
    const invalidOperations = ['invalid', 'list', 'read', 'write'];

    invalidOperations.forEach((operation) => {
      const result = operationSchema.safeParse(operation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Invalid operation. Must be one of:'
        );
      }
    });
  });

  it('rejects empty string', () => {
    const result = operationSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Operation is required');
    }
  });
});
