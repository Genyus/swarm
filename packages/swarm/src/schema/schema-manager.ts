import type { SchemaFieldMetadata, SchemaMetadata } from './metadata';
import { getSchemaMetadata } from './metadata';
import type { StandardSchemaV1 } from './standard';

/**
 * Utilities for working with Standard Schema metadata.
 */
export const SchemaManager = {
  getShape(schema: StandardSchemaV1): SchemaMetadata['fields'] | undefined {
    return getSchemaMetadata(schema)?.fields;
  },

  getCommandMetadata(
    field: SchemaFieldMetadata
  ): SchemaFieldMetadata | undefined {
    return field;
  },

  isFieldRequired(field: SchemaFieldMetadata): boolean {
    return field.required ?? true;
  },

  getFieldTypeName(field: SchemaFieldMetadata): string {
    return field.type;
  },

  getArrayElement(field: SchemaFieldMetadata): SchemaFieldMetadata | undefined {
    return field.elementType;
  },

  getEnumValues(field: SchemaFieldMetadata): (string | number)[] | undefined {
    return field.enumValues;
  },

  findEnumValue(enumValues: Record<string, string>, value: string): string {
    const mapped = enumValues[value.toUpperCase() as keyof typeof enumValues];
    return mapped || value;
  },
};
