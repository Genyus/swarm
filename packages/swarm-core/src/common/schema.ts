import { ZodType } from 'zod';
import { FieldMetadata } from '../contracts';

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
