import { Generator } from '@ingenyus/swarm';

/**
 * Interface for Wasp configuration generators
 * @interface ConfigGenerator
 * @property {Generator<string>} Generator - The generator interface
 * @property {string} update - The update method
 */
export interface ConfigGenerator extends Generator<string> {
  /**
   * Updates a declaration in a Wasp configuration file
   * @param featurePath - The path to the feature directory
   * @param declaration - The declaration to add or update
   * @returns The updated feature configuration file
   */
  update(featurePath: string, declaration: string): string;
}
