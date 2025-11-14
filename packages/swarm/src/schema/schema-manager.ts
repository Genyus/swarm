import type { SchemaFieldMetadata, SchemaMetadata } from './metadata';
import { getSchemaMetadata } from './metadata';
import type { StandardSchemaV1 } from './standard';

/**
 * Utility class for working with Standard Schema metadata.
 */
export class SchemaManager {
  static getShape(
    schema: StandardSchemaV1
  ): SchemaMetadata['fields'] | undefined {
    return getSchemaMetadata(schema)?.fields;
  }

  static getCommandMetadata(
    field: SchemaFieldMetadata
  ): SchemaFieldMetadata | undefined {
    return field;
  }

  static isFieldRequired(field: SchemaFieldMetadata): boolean {
    return field.required ?? true;
  }

  static getFieldTypeName(field: SchemaFieldMetadata): string {
    return field.type;
  }

  static getArrayElement(
    field: SchemaFieldMetadata
  ): SchemaFieldMetadata | undefined {
    return field.elementType;
  }

  static getEnumValues(
    field: SchemaFieldMetadata
  ): (string | number)[] | undefined {
    return field.enumValues;
  }

  static findEnumValue(
    enumValues: Record<string, string>,
    value: string
  ): string {
    const mapped = enumValues[value.toUpperCase() as keyof typeof enumValues];
    return mapped || value;
  }
}
