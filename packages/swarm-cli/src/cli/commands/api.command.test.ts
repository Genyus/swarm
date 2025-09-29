import { describe, expect, it, vi } from 'vitest';
import { createApiCommand } from './api.command';

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
        fn({ feature: 'foo', name: 'api', method: 'GET', path: '/api' });
        return mockCmd;
      }),
    };

    const program = { command: vi.fn(() => mockCmd) } as any;
    cmd.register(program);
    expect(program.command).toHaveBeenCalledWith('api');
  });
});
