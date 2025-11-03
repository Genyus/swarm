import { FileSystem, realFileSystem } from '../common';
import { Logger, logger as singletonLogger } from '../logger';
import { SwarmGenerator } from './types';
import { ZodType } from 'zod';

/**
 * Services available to generators via the runtime
 */
export interface GeneratorServices {
  fileSystem: FileSystem;
  logger: Logger;
  featureGeneratorFactory?: (
    services: GeneratorServices
  ) => SwarmGenerator<ZodType>;
  // future shared services can be added here
}

/**
 * Stack-based runtime container for generator dependencies.
 * Provides scoped service access in production and isolated overrides for tests.
 */
export class GeneratorRuntime {
  private static stack: GeneratorServices[] = [
    { fileSystem: realFileSystem, logger: singletonLogger },
  ];

  /**
   * Get the current service snapshot from the top of the stack
   */
  static current(): GeneratorServices {
    return this.stack[this.stack.length - 1];
  }

  /**
   * Execute a function with service overrides scoped to that execution.
   * The overrides are merged with the current services, pushed onto the stack,
   * and automatically popped when the function completes (even if it throws).
   *
   * @param overrides - Partial service overrides to apply
   * @param fn - Function to execute with the overridden services
   * @returns The return value of the function
   */
  static withOverrides<T>(
    overrides: Partial<GeneratorServices>,
    fn: () => T
  ): T {
    const merged = { ...this.current(), ...overrides };
    this.stack.push(merged);
    try {
      return fn();
    } finally {
      this.stack.pop();
    }
  }
}
