import { GeneratorBase } from './generator.base';
import { GeneratorRuntime, GeneratorServices } from './runtime';

/**
 * Create a generator instance with service overrides for testing.
 *
 * @param ctor - Constructor function for the generator class
 * @param overrides - Service overrides to apply during instantiation
 * @param configure - Optional callback to configure the instance after creation
 * @returns A new generator instance created with the specified service overrides
 *
 * @example
 * ```typescript
 * const mockFS = createMockFS();
 * const mockLogger = createMockLogger();
 * const apiGen = createGenerator(
 *   ApiGenerator,
 *   { fileSystem: mockFS, logger: mockLogger },
 *   (instance) => {
 *     // configure instance if needed
 *   }
 * );
 * ```
 */
export function createGenerator<T extends GeneratorBase<any>>(
  ctor: new () => T,
  overrides: Partial<GeneratorServices> = {},
  configure?: (instance: T) => void
): T {
  const mergedServices = { ...GeneratorRuntime.current(), ...overrides };
  const instance = GeneratorRuntime.withOverrides(overrides, () => {
    const inst = new ctor();

    configure?.(inst);
    // Store services on instance to persist beyond withOverrides scope
    (inst as any).__testServices = mergedServices;

    return inst;
  });

  if (overrides.fileSystem || overrides.logger) {
    Object.defineProperty(instance, 'fileSystem', {
      get: function () {
        return (
          (this as any).__testServices?.fileSystem ??
          GeneratorRuntime.current().fileSystem
        );
      },
      configurable: true,
    });
    Object.defineProperty(instance, 'logger', {
      get: function () {
        return (
          (this as any).__testServices?.logger ??
          GeneratorRuntime.current().logger
        );
      },
      configurable: true,
    });
  }

  return instance;
}
