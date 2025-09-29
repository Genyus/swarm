import { describe, expect, it, vi } from 'vitest';
import { createJobCommand } from './job.command';

vi.mock('@ingenyus/swarm-core', async () => {
  const actual = await vi.importActual('@ingenyus/swarm-core');

  return {
    ...actual,
    JobGenerator: vi.fn().mockImplementation(() => ({
      generate: vi.fn(),
    })),
  };
});

describe('createJobCommand', () => {
  it('registers and calls generator', async () => {
    const cmd = createJobCommand();

    // Simulate Commander
    const mockCmd = {
      requiredOption: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      action: vi.fn((fn) => {
        fn({ feature: 'foo', name: 'job' });
        return mockCmd;
      }),
    };

    const program = { command: vi.fn(() => mockCmd) } as any;
    cmd.register(program);
    expect(program.command).toHaveBeenCalledWith('job');
  });
});
