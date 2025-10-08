import { SwarmGenerator } from './generator';

/**
 * Base interface for factories that create interfaces from generators
 * Provides a consistent pattern for CLI commands and MCP tools
 */
export abstract class GeneratorInterfaceFactory<TInterface> {
  /**
   * Create an interface from a generator
   * @param generator The generator to create an interface for
   * @returns The created interface
   */
  abstract createInterface(generator: SwarmGenerator): TInterface;

  /**
   * Create interfaces from multiple generators
   * @param generators Array of generators
   * @returns Array of created interfaces with their generator names
   */
  createInterfaces(
    generators: SwarmGenerator[]
  ): Array<{ name: string; interface: TInterface }> {
    return generators.map((generator) => ({
      name: generator.name,
      interface: this.createInterface(generator),
    }));
  }

  /**
   * Create interfaces from multiple generators and return as a map
   * @param generators Array of generators
   * @returns Map of generator names to interfaces
   */
  createInterfaceMap(generators: SwarmGenerator[]): Record<string, TInterface> {
    const result: Record<string, TInterface> = {};

    for (const generator of generators) {
      try {
        result[generator.name] = this.createInterface(generator);
      } catch (error) {
        this.handleCreationError(generator.name, error);
      }
    }

    return result;
  }

  /**
   * Handle interface creation errors
   * Can be overridden by concrete classes for custom error handling
   */
  protected handleCreationError(generatorName: string, error: unknown): void {
    console.warn(
      `Failed to create interface for generator '${generatorName}':`,
      error
    );
  }
}
