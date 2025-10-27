/**
 * Interface for Wasp configuration generators
 * ConfigGenerator has its own generate method signature that takes a string argument
 * @interface ConfigGenerator
 */
export interface ConfigGenerator {
  /**
   * Generate configuration from string argument
   * @param args - String configuration argument
   */
  generate(args: string): Promise<void> | void;

  /**
   * Updates a declaration in a Wasp configuration file
   * @param featurePath - The path to the feature directory
   * @param declaration - The declaration to add or update
   * @returns The updated feature configuration file
   */
  update(featurePath: string, declaration: string): string;
}
