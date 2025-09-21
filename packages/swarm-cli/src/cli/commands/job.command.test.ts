import type { NodeGenerator } from '@ingenyus/swarm-core';
import { describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../tests/utils';
import { createJobCommand } from './job.command';

describe('createJobCommand', () => {
  it('registers and calls generator', async () => {
    const logger = createMockLogger();
    const fs = createMockFS();
    const featureGen = createMockFeatureGen();
    const generator = { generate: vi.fn() } as unknown as NodeGenerator;
    const cmd = createJobCommand(logger, fs, featureGen);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program = { command: vi.fn(() => mockCmd) } as any;
    cmd.register(program, generator);
    expect(program.command).toHaveBeenCalledWith('job');
  });
});
