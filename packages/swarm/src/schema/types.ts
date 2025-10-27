import z, { ZodType } from 'zod';

/**
 * Extends a Zod schema with metadata
 * @param schema The Zod schema to extend
 * @param metadata Field metadata to attach
 * @returns Extended schema with metadata
 */
export function extend<T extends ZodType>(
  schema: T,
  metadata: FieldMetadata
): T & { _metadata: FieldMetadata } {
  return Object.assign(schema, { _metadata: metadata });
}

/**
 * Type for schemas that have been extended with metadata
 */
export type ExtendedSchema<S extends ZodType = ZodType> = S & {
  _metadata?: FieldMetadata;
};

/**
 * Pre-parse type (what callers can pass)
 */
export type In<S extends ZodType> = z.input<S>;

/**
 * Post-parse type
 */
export type Out<S extends ZodType> = z.infer<S>;

/**
 * Metadata for individual schema fields
 */
export interface FieldMetadata {
  /** Human-readable description of the field */
  description: string;
  /** Friendly display name for the field */
  friendlyName: string;
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
