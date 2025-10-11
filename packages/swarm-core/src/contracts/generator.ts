import { ExtendedSchema } from '../common/schema';

/**
 * Core generator interface
 */
export interface Generator<TArgs = any> {
  /** Generate code based on parameters */
  generate: (params: TArgs) => Promise<void> | void;
}

/**
 * Core generator interface
 */
export interface SwarmGenerator<TArgs = any> extends Generator<TArgs> {
  /** Unique generator name */
  name: string;
  /** Human-readable description */
  description: string;
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
