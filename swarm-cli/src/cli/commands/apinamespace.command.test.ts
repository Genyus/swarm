import { describe, expect, it, vi } from 'vitest';
import type { IFeatureGenerator, NodeGenerator } from '../../types/generator';
import { createApiNamespaceCommand } from './apinamespace.command';

describe('createApiNamespaceCommand', () => {
  function createMockLogger() {
    return { debug: vi.fn(), info: vi.fn(), success: vi.fn(), error: vi.fn(), warn: vi.fn() };
  }
  function createMockFS() {
    return { readFileSync: vi.fn(), writeFileSync: vi.fn(), existsSync: vi.fn(), copyFileSync: vi.fn(), mkdirSync: vi.fn(), readdirSync: vi.fn() };
  }
  function createMockFeatureGen(): IFeatureGenerator {
    return {
      updateFeatureConfig: vi.fn(),
      generateFeatureConfig: vi.fn(),
      generateFeature: vi.fn(),
    } as any;
  }

  it('registers and calls generator', async () => {
    const logger = createMockLogger();
    const fs = createMockFS();
    const featureGen = createMockFeatureGen();
    const generator = { generate: vi.fn() } as unknown as NodeGenerator;
    const cmd = createApiNamespaceCommand(logger, fs, featureGen);
    // Simulate Commander
    const mockCmd = {
      requiredOption: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      action: vi.fn((fn) => { fn({ feature: 'foo', name: 'ns', path: '/api' }); return mockCmd; }),
    };
    const program = { command: vi.fn(() => mockCmd) } as any;
    cmd.register(program, generator);
    expect(program.command).toHaveBeenCalledWith('apinamespace');
  });
}); 