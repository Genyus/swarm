import { ZodObject, ZodRawShape, ZodType } from 'zod';
import { CommandMetadata, commandRegistry } from './types';

interface ZodArrayDef {
  type: 'array';
  element: ZodType;
}

interface ZodEnumDef {
  type: 'enum';
  entries: Record<string, string | number>;
}

interface ZodOptionalDef {
  type: 'optional';
  innerType: ZodType;
}

interface ZodDefaultDef {
  type: 'default';
  innerType: ZodType;
  defaultValue: unknown;
}

/**
 * Type-safe utility class for analysing Zod schemas.
 * Consolidates schema introspection logic used across CommandFactory and ToolFactory.
 */
export class SchemaManager {
  /**
   * Get the shape object from a ZodObject schema.
   * @param schema The extended schema to extract shape from
   * @returns The raw shape object or undefined if not a ZodObject
   */
  static getShape(schema: ZodType): ZodRawShape | undefined {
    if (schema instanceof ZodObject) {
      return schema.shape;
    }
    return undefined;
  }

  /**
   * Determine if a field is required (not optional).
   * @param fieldSchema The Zod schema for the field
   * @returns True if the field is required
   */
  static isFieldRequired(fieldSchema: ZodType): boolean {
    return fieldSchema._zod.def.type !== 'optional';
  }

  /**
   * Extract command metadata from a field schema.
   * @param fieldSchema The Zod schema for the field
   * @returns Field metadata if present
   */
  static getCommandMetadata(fieldSchema: ZodType): CommandMetadata | undefined {
    // Try registry lookup on the schema directly
    let metadata = commandRegistry.get(fieldSchema);
    if (metadata) return metadata;

    // If not found, try unwrapping optional/default wrappers
    const innerType = SchemaManager.getInnerType(fieldSchema);
    if (innerType) {
      metadata = commandRegistry.get(innerType);
      if (metadata) return metadata;
    }

    // If still not found, try unwrapping default
    const defaultInfo = SchemaManager.getDefaultInnerType(fieldSchema);
    if (defaultInfo) {
      metadata = commandRegistry.get(defaultInfo.innerType);
      if (metadata) return metadata;
    }

    return undefined;
  }

  /**
   * Get the Zod type name for a field, unwrapping optional types.
   * @param fieldSchema The Zod schema for the field
   * @returns The underlying type name
   */
  static getFieldTypeName(fieldSchema: ZodType): string {
    const isRequired = this.isFieldRequired(fieldSchema);

    if (isRequired) {
      return fieldSchema._zod.def.type;
    }

    // For optional fields, get the inner type
    return (this.getInnerType(fieldSchema) ?? fieldSchema)._zod.def.type;
  }

  /**
   * Get the element type from an array schema.
   * @param fieldSchema The Zod schema for the field
   * @returns The array element type or undefined if not an array
   */
  static getArrayElement(fieldSchema: ZodType): ZodType | undefined {
    if (fieldSchema._zod.def.type === 'array') {
      return (fieldSchema._zod.def as ZodArrayDef).element;
    }

    return undefined;
  }

  /**
   * Get enum values from an enum schema.
   * @param fieldSchema The Zod schema for the field
   * @returns The enum values as an array or undefined if not an enum
   */
  static getEnumValues(fieldSchema: ZodType): (string | number)[] | undefined {
    if (fieldSchema._zod.def.type === 'enum') {
      return Object.values((fieldSchema._zod.def as ZodEnumDef).entries);
    }

    if (fieldSchema._zod.def.type === 'optional') {
      const innerType = this.getInnerType(fieldSchema);

      return innerType ? this.getEnumValues(innerType) : undefined;
    }

    return undefined;
  }

  /**
   * Get the inner type from an optional schema.
   * @param fieldSchema The Zod schema for the field
   * @returns The inner type or undefined if not optional
   */
  static getInnerType(fieldSchema: ZodType): ZodType | undefined {
    if (fieldSchema._zod.def.type === 'optional') {
      const optionalDef = fieldSchema._zod.def as ZodOptionalDef;

      if ('unwrap' in fieldSchema && typeof fieldSchema.unwrap === 'function') {
        return fieldSchema.unwrap();
      }

      return optionalDef.innerType;
    }

    return undefined;
  }

  /**
   * Get the inner type and default value from a default schema.
   * @param fieldSchema The Zod schema for the field
   * @returns Object with innerType and defaultValue or undefined if not a default schema
   */
  static getDefaultInnerType(
    fieldSchema: ZodType
  ): { innerType: ZodType; defaultValue: unknown } | undefined {
    if (fieldSchema._zod.def.type === 'default') {
      const defaultDef = fieldSchema._zod.def as ZodDefaultDef;
      return {
        innerType: defaultDef.innerType,
        defaultValue: defaultDef.defaultValue,
      };
    }
    return undefined;
  }

  /**
   * Get a case-insensitive enum value from a record of enum values.
   * @param enumValues The record of enum values
   * @param value The value to get
   * @returns The case-insensitive enum value or the original value if not found
   */
  static findEnumValue(
    enumValues: Record<string, string>,
    value: string
  ): string {
    const mapped = (
      enumValues as Record<string, (typeof enumValues)[keyof typeof enumValues]>
    )[value.toUpperCase()];

    return mapped || value;
  }
}
