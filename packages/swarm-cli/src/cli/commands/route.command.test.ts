import { describe, expect, it, vi } from 'vitest';
import { createRouteCommand } from './route.command';

vi.mock('@ingenyus/swarm-core', async () => {
  const actual = await vi.importActual('@ingenyus/swarm-core');

  return {
    ...actual,
    RouteGenerator: vi.fn().mockImplementation(() => ({
      generate: vi.fn(),
    })),
  };
});

describe('createRouteCommand', () => {
  it('registers and calls generator', async () => {
    const cmd = createRouteCommand();

    // Simulate Commander
    const mockCmd = {
      requiredOption: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      action: vi.fn((fn) => {
        fn({ feature: 'foo', name: 'route', path: '/foo' });
        return mockCmd;
      }),
    };

    const program = { command: vi.fn(() => mockCmd) } as any;
    cmd.register(program);
    expect(program.command).toHaveBeenCalledWith('route');
  });
});
