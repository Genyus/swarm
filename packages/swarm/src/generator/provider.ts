import { GeneratorServices } from './services';
import { Generator } from './types';

/**
 * Provider interface for creating a generator instances with injected services
 */
export interface GeneratorProvider {
  /**
   * Create a generator instance
   * @param services - Services to inject into the generator
   * @returns Generator instance
   */
  create: (services: GeneratorServices) => Generator | Promise<Generator>;
}

/**
 * Creates providers for the given generator classes
 * @param generatorClasses - Array of generator class constructors
 * @returns Array of generator providers
 */
export function createProviders(
  ...generatorClasses: Array<
    new (services: GeneratorServices) => Generator<any>
  >
): Array<GeneratorProvider> {
  return generatorClasses.map(
    (GeneratorClass): GeneratorProvider => ({
      create: (services) => new GeneratorClass(services),
    })
  );
}
