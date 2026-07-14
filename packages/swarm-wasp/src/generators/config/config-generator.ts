/**
 * A `with { type: "ref" }` import that a spec declaration depends on.
 */
export interface RefImport {
  /** Named exports to import, e.g. `["getTasks"]`. */
  names: string[];
  /** Module specifier relative to the feature file, e.g. `./server/queries/getTasks`. */
  from: string;
}

/**
 * A native Wasp spec declaration produced by a component generator, ready to be
 * inserted into a feature's `spec` array by {@link ConfigGenerator.update}.
 */
export interface SpecDeclaration {
  /** The spec constructor kind, e.g. `query`, `route`, `crud`, `job`. */
  kind: string;
  /**
   * The full constructor call text, e.g.
   * `query(getTasks, { entities: ["Task"], auth: true })`.
   */
  call: string;
  /** The `with { type: "ref" }` imports the call references. */
  refImports: RefImport[];
}

/**
 * Interface for Wasp configuration generators.
 * @interface ConfigGenerator
 */
export interface ConfigGenerator {
  /**
   * Generate a feature configuration file in the given feature directory.
   * @param args - The feature directory path
   */
  generate(args: string): Promise<void> | void;

  /**
   * Inserts or replaces a declaration in a feature's `spec` array (and keeps its
   * imports in sync).
   * @param featurePath - The path to the feature directory
   * @param declaration - The native spec declaration to add or update
   * @returns The path to the updated feature configuration file
   */
  update(featurePath: string, declaration: SpecDeclaration): string;
}
