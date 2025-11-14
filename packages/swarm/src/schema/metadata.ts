import type { StandardSchemaV1 } from './standard';

/**
 * The type of the value of a schema field
 */
export type SchemaValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'enum'
  | 'object';

/**
 * Metadata for a schema field
 * @see https://standard-schema.org/docs/metadata
 */
export interface SchemaFieldMetadata {
  /** The value type of the field */
  type: SchemaValueType;
  /** Whether the field is required */
  required?: boolean;
  /** The description of the field */
  description?: string;
  /** The short name of the field, used for the command line interface */
  shortName?: string;
  /** The help text of the field */
  helpText?: string;
  /** Examples provided for the field, used for the command line interface */
  examples?: string[];
  /** The default value of the field */
  defaultValue?: unknown;
  /** The enum values of the field */
  enumValues?: (string | number)[];
  /** The element type of the field */
  elementType?: SchemaFieldMetadata;
  /** The metadata properties of the field */
  fields?: Record<string, SchemaFieldMetadata>;
}

export interface SchemaMetadata {
  /** The description of the schema */
  description?: string;
  /** The fields of the schema */
  fields: Record<string, SchemaFieldMetadata>;
}

const metadataRegistrySymbol = Symbol.for('swarm.standardSchemaMetadata');

type GlobalWithRegistry = typeof globalThis & {
  [metadataRegistrySymbol]?: WeakMap<StandardSchemaV1, SchemaMetadata>;
};

const globalWithRegistry = globalThis as GlobalWithRegistry;

const registry =
  globalWithRegistry[metadataRegistrySymbol] ??
  (globalWithRegistry[metadataRegistrySymbol] = new WeakMap<
    StandardSchemaV1,
    SchemaMetadata
  >());

export function registerSchemaMetadata<T extends StandardSchemaV1>(
  schema: T,
  metadata: SchemaMetadata
): T {
  registry.set(schema, metadata);
  return schema;
}

export function getSchemaMetadata(
  schema: StandardSchemaV1
): SchemaMetadata | undefined {
  return registry.get(schema);
}
