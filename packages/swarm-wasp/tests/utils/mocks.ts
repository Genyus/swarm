import type {
  FileSystem,
  Generator,
  GeneratorBase,
  GeneratorProvider,
  GeneratorServices,
  Logger,
  StandardSchemaV1,
} from '@ingenyus/swarm';
import { getGeneratorServices } from '@ingenyus/swarm';
import { vi } from 'vitest';

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

export function createMockFeatureGen<S extends StandardSchemaV1>(
  s: S
): Generator<S> {
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
 * @param schema - The Zod schema for the generator
 * @param overrides - Optional service overrides to apply
 * @returns A new generator instance created with mock services
 *
 * @example
 * ```typescript
 * const apiGen = await createTestGenerator(ApiGenerator, apiSchema);
 * const customGen = await createTestGenerator(FeatureGenerator, featureSchema, {
 *   fileSystem: customMockFS
 * });
 * ```
 */
export async function createTestGenerator<T extends GeneratorBase<any>>(
  ctor: new (services: GeneratorServices) => T,
  schema: StandardSchemaV1,
  overrides: Partial<GeneratorServices> = {}
): Promise<T> {
  const mockFS = createMockFS();
  const mockLogger = createMockLogger();
  const provider: GeneratorProvider = {
    create: (services: GeneratorServices) => new ctor(services),
  };
  const services = getGeneratorServices('test', mockLogger, {
    fileSystem: mockFS,
    ...overrides,
  });
  return (await provider.create(services)) as T;
}
