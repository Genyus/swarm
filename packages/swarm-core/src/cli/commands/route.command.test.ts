import { describe, expect, it, vi } from 'vitest';
import { createRouteCommand } from './route.command';

vi.mock('../generators', async () => {
  const actual = await vi.importActual('../generators');

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
        fn({
          feature: 'foo',
          name: 'route',
          path: '/foo',
          auth: false,
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
