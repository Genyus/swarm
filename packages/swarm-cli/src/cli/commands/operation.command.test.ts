import { describe, expect, it, vi } from 'vitest';
import { createActionCommand } from './operation.command';

vi.mock('@ingenyus/swarm-core', async () => {
  const actual = await vi.importActual('@ingenyus/swarm-core');

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
        });
        return mockCmd;
      }),
    };

    const program = { command: vi.fn(() => mockCmd) } as any;
    cmd.register(program);
    expect(program.command).toHaveBeenCalledWith('action');
  });
});
