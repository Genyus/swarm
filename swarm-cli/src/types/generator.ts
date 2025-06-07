import { IFileSystem } from "./filesystem";
import { Logger } from "./logger";

/**
 * Interface for feature generators
 * @interface IFeatureGenerator
 * @property {Logger} logger - The logger instance
 * @property {IFileSystem} fs - The file system instance
 */
export interface IFeatureGenerator {
  /**
   * Generates a feature configuration file.
   * @param {string} featureName - The name of the feature
   */
  generateFeatureConfig(featureName: string): void;

  /**
   * Generates a feature directory.
   * @param {string} featurePath - The path to the feature
   */
  generateFeature(featurePath: string): void;

  /**
   * Updates or creates a feature configuration file with new definitions.
   * @param {string} featurePath - The path to the feature
   * @param {string} type - The type of feature
   * @param {Record<string, any>} options - The options for the feature
   * @returns {string} The updated feature configuration file
   */
  updateFeatureConfig(
    featurePath: string,
    type: string,
    options: Record<string, any>
  ): string;
}

/**
 * Interface for Wasp config node generators
 * @interface NodeGenerator
 * @property {Logger} logger - The logger instance
 * @property {IFileSystem} fs - The file system instance
 * @property {Function} generate - The main entrypoint for CLI integration
 */
export interface NodeGenerator {
  /**
   * Generate a Wasp object
   * @param {any[]} args - The arguments for the generator
   * @returns {Promise<void> | void} - The result of the generator
   */
  generate(...args: any[]): Promise<void> | void;

  /**
   * The logger instance
   * @type {Logger}
   */
  logger: Logger;

  /**
   * The file system instance
   * @type {IFileSystem}
   */
  fs: IFileSystem;
}
