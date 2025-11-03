import type {
  FileSystem,
  GeneratorBase,
  GeneratorServices,
  Logger,
  SwarmGenerator,
} from '@ingenyus/swarm';
import { createGenerator } from '@ingenyus/swarm';
import { vi } from 'vitest';
import { ZodType } from 'zod';

export function createMockLogger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  } as Logger;
}

export function createMockFS(): FileSystem {
  return {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(),
    copyFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
  } as FileSystem;
}

export function createMockFeatureGen<S extends ZodType>(
  s: S
): SwarmGenerator<S> {
  return {
    name: 'feature',
    description: 'Mock',
    schema: s,
    generate: vi.fn(),
  };
}

/**
 * Convenience helper for creating generators in tests with default mocks.
 * Automatically provides mock filesystem and logger, with optional overrides.
 *
 * @param ctor - Constructor function for the generator class
 * @param overrides - Optional service overrides to apply
 * @returns A new generator instance created with mock services
 *
 * @example
 * ```typescript
 * const apiGen = createTestGenerator(ApiGenerator);
 * const customGen = createTestGenerator(FeatureGenerator, {
 *   fileSystem: customMockFS
 * });
 * ```
 */
export function createTestGenerator<T extends GeneratorBase<any>>(
  ctor: new () => T,
  overrides: Partial<GeneratorServices> = {}
): T {
  const mockFS = createMockFS();
  const mockLogger = createMockLogger();
  return createGenerator(
    ctor,
    { fileSystem: mockFS, logger: mockLogger, ...overrides }
  );
}
