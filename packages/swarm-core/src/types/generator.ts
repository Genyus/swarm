import { ExtendedSchema } from '../utils/schema-builder';
import { IFileSystem } from './filesystem';
import { Logger } from './logger';

/**
 * Core generator interface
 */
export interface SwarmGenerator {
  /** Unique generator name */
  name: string;
  /** Human-readable description */
  description: string;

  /** Generate code based on parameters */
  generate: (params: any) => Promise<GenerationResult>;

  /** Create CLI command based on arguments and options */
  createCommand: (args: any, options: any) => Promise<CommandResult>;

  /** Execute MCP tool with parameters */
  executeTool: (params: any) => Promise<MCPToolResult>;

  /** Schema with metadata for validation and help generation */
  schema: ExtendedSchema;

  /** Template names bundled with this generator */
  templates?: string[];
}

/**
 * Result of a generation operation
 */
export interface GenerationResult {
  /** Whether the generation was successful */
  success: boolean;
  /** Generated file paths */
  files: string[];
  /** Any error that occurred */
  error?: string;
  /** Additional metadata about the generation */
  metadata?: Record<string, any>;
}

/**
 * Result of a CLI command execution
 */
export interface CommandResult {
  /** Whether the command was successful */
  success: boolean;
  /** Output message */
  message: string;
  /** Any error that occurred */
  error?: string;
  /** Exit code */
  exitCode: number;
}

/**
 * Result of an MCP tool execution
 */
export interface MCPToolResult {
  /** Whether the tool execution was successful */
  success: boolean;
  /** Tool output data */
  data?: any;
  /** Any error that occurred */
  error?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validated data (if valid) */
  data?: any;
  /** Validation errors (if invalid) */
  errors?: string[];
}

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
   * Updates or creates a feature configuration file with a pre-built definition.
   * @param {string} featurePath - The path to the feature
   * @param {string} definition - The pre-built definition string to add
   * @returns {string} The updated feature configuration file
   */
  updateFeatureConfig(featurePath: string, definition: string): string;
}

/**
 * Interface for Wasp config node generators
 * @interface NodeGenerator
 * @template TFlags - The type of flags/options for the generator
 * @property {Logger} logger - The logger instance
 * @property {IFileSystem} fs - The file system instance
 * @property {Function} generate - The main entrypoint for CLI integration
 */

export interface NodeGenerator<TFlags = any> {
  /**
   * Generate a Wasp object
   * @param {string} featurePath - The feature path
   * @param {TFlags} flags - The generator flags/options
   * @returns {Promise<void> | void} - The result of the generator
   */
  generate(featurePath: string, flags: TFlags): Promise<void> | void;

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
