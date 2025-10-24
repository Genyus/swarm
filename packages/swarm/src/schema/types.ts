import { ZodType } from 'zod';

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
export type ExtendedSchema = ZodType & { _metadata?: FieldMetadata };

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
