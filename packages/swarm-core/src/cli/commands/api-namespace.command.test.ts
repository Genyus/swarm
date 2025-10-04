import { describe, expect, it, vi } from 'vitest';
import { createApiNamespaceCommand } from './api-namespace.command';

vi.mock('../generators', async () => {
  const actual = await vi.importActual('../generators');

  return {
    ...actual,
    ApiNamespaceGenerator: vi.fn().mockImplementation(() => ({
      generate: vi.fn(),
    })),
  };
});

describe('createApiNamespaceCommand', () => {
  it('registers and calls generator', async () => {
    const cmd = createApiNamespaceCommand();

    // Simulate Commander
    const mockCmd = {
      requiredOption: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      action: vi.fn((fn) => {
        fn({
          feature: 'foo',
          name: 'ns',
          path: '/api',
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
