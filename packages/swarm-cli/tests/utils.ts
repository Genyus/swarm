import type {
  IFeatureGenerator,
  IFileSystem,
  Logger,
} from '@ingenyus/swarm-core';
import { Stats } from 'node:fs';
import { vi } from 'vitest';

/**
 * Creates a mock filesystem implementation for testing.
 *
 * @returns A mock IFileSystem object with all methods stubbed using Vitest's vi.fn()
 */
export function createMockFS(): IFileSystem {
  return {
    readFileSync: vi.fn(() => 'template'),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(() => true),
    copyFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(() => []),
    statSync: vi.fn(() => ({}) as Stats),
  };
}

/**
 * Creates a mock logger implementation for testing.
 *
 * @returns A mock Logger object with all logging methods stubbed using Vitest's vi.fn()
 */
export function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  };
}

/**
 * Creates a mock feature generator implementation for testing.
 *
 * @returns A mock IFeatureGenerator object with methods stubbed using Vitest's vi.fn()
 */
export function createMockFeatureGen(): IFeatureGenerator {
  return {
    updateFeatureConfig: vi.fn(() => 'config'),
    generateFeatureConfig: vi.fn(() => 'config'),
    generateFeature: vi.fn(() => 'config'),
  };
}
