import { describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../test/utils';
import type { NodeGenerator } from '../../types/generator';
import { createApiCommand } from './api.command';

describe('createApiCommand', () => {
  it('registers and calls generator', async () => {
    const logger = createMockLogger();
    const fs = createMockFS();
    const featureGen = createMockFeatureGen();
    const generator = { generate: vi.fn() } as unknown as NodeGenerator;
    const cmd = createApiCommand(logger, fs, featureGen);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program = { command: vi.fn(() => mockCmd) } as any;
    cmd.register(program, generator);
    expect(program.command).toHaveBeenCalledWith('api');
  });
});
