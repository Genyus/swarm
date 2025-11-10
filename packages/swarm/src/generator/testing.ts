import { GeneratorBase } from './generator.base';
import { SwarmGeneratorProvider } from './provider';
import { GeneratorServices, getGeneratorServices } from './services';

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
export async function createGenerator<T extends GeneratorBase<any>>(
  provider: SwarmGeneratorProvider,
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
