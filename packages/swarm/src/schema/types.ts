import z, { ZodType } from 'zod';

/**
 * Global type with registry
 */
type GlobalWithRegistry = typeof globalThis & {
  [registryKey]?: z.core.$ZodRegistry<CommandMetadata>;
};

const registryKey = Symbol.for('swarm.commandRegistry');
const globalWithRegistry = globalThis as GlobalWithRegistry;

/**
 * Memoized custom Zod registry for storing CLI-specific metadata
 */
export const commandRegistry =
  globalWithRegistry[registryKey] ??
  (globalWithRegistry[registryKey] = z.registry<CommandMetadata>());

/**
 * Pre-parse type (what callers can pass)
 */
export type In<S extends ZodType> = z.input<S>;

/**
 * Post-parse type
 */
export type Out<S extends ZodType> = z.infer<S>;

/**
 * CLI command metadata for schema fields
 * Descriptions should be set using Zod's native .meta() method
 */
export interface CommandMetadata {
  /** Example values for the field */
  examples?: string[];
  /** Additional help text for the field */
  helpText?: string;
  /** Short name for command-line options (e.g., 'r' for 'route') */
  shortName?: string;
  /** Default value for the field */
  defaultValue?: any;
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
