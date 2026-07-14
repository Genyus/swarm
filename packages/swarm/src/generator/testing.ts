import type { GeneratorBase } from './generator.base';
import type { GeneratorProvider } from './provider';
import { type GeneratorServices, getGeneratorServices } from './services';

/**
 * Create a generator instance from a provider with service overrides for testing.
 *
 * @param provider - Generator provider
 * @param overrides - Service overrides to apply during instantiation
 * @returns A new generator instance created with the specified service overrides
 *
 * @example
 * ```typescript
 * const mockFS = createMockFS();
 * const mockLogger = createMockLogger();
 * const apiGen = await createGenerator(
 *   apiProvider,
 *   { fileSystem: mockFS, logger: mockLogger }
 * );
 * ```
 */
// biome-ignore lint/suspicious/noExplicitAny: constraint must accept generators of any concrete schema; GeneratorBase is invariant over its schema type
export async function createGenerator<T extends GeneratorBase<any>>(
  provider: GeneratorProvider,
  overrides: Partial<GeneratorServices> = {}
): Promise<T> {
  const logger = overrides.logger || {
    debug: () => {},
    info: () => {},
    success: () => {},
    warn: () => {},
    error: () => {},
  };
  const services = getGeneratorServices('test', logger, overrides);
  return (await provider.create(services)) as T;
}
