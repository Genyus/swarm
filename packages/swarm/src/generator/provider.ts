import type { GeneratorServices } from './services';
import type { Generator } from './types';

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
 * Schema placeholder for generator types that must accept any concrete schema.
 *
 * `Generator` is invariant over its schema type (the schema appears in both
 * covariant and contravariant positions), so a concrete `Generator<SomeSchema>`
 * is not assignable to `Generator<StandardSchemaV1>`. `any` is required to
 * accept generator classes for any concrete schema.
 */
// biome-ignore lint/suspicious/noExplicitAny: see note above on schema invariance
type AnySchema = any;

/**
 * Constructor for a generator of any schema.
 */
export type GeneratorConstructor = new (
  services: GeneratorServices
) => Generator<AnySchema>;

/**
 * Creates providers for the given generator classes
 * @param generatorClasses - Array of generator class constructors
 * @returns Array of generator providers
 */
export function createProviders(
  ...generatorClasses: Array<GeneratorConstructor>
): Array<GeneratorProvider> {
  return generatorClasses.map(
    (GeneratorClass): GeneratorProvider => ({
      create: (services) => new GeneratorClass(services),
    })
  );
}
