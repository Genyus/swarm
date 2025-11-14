import { describe, expect, it } from 'vitest';
import { SchemaManager, StandardSchemaV1 } from '.';
import { registerSchemaMetadata, SchemaMetadata } from './metadata';

function createSchema(metadata?: SchemaMetadata): StandardSchemaV1 {
  const schema: StandardSchemaV1 = {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate: (value) => ({ value }),
    },
  };

  if (metadata) {
    registerSchemaMetadata(schema, metadata);
  }

  return schema;
}

describe('SchemaManager', () => {
  describe('getShape', () => {
    it('returns registered fields when metadata exists', () => {
      const schema = createSchema({
        fields: {
          name: { type: 'string', required: true },
          age: { type: 'number' },
        },
      });

      const shape = SchemaManager.getShape(schema);

      expect(shape).toBeDefined();
      expect(Object.keys(shape!)).toEqual(['name', 'age']);
    });

    it('returns undefined when no metadata is registered', () => {
      const schema = createSchema();
      expect(SchemaManager.getShape(schema)).toBeUndefined();
    });
  });

  describe('field helpers', () => {
    const schema = createSchema({
      fields: {
        requiredField: {
          type: 'string',
          required: true,
          description: 'Required value',
          examples: ['foo'],
          shortName: 'r',
        },
        optionalField: {
          type: 'string',
          required: false,
        },
        arrayField: {
          type: 'array',
          elementType: { type: 'string' },
        },
        enumField: {
          type: 'enum',
          enumValues: ['a', 'b'],
        },
      },
    });

    const shape = SchemaManager.getShape(schema)!;

    it('detects required flags', () => {
      expect(SchemaManager.isFieldRequired(shape.requiredField)).toBe(true);
      expect(SchemaManager.isFieldRequired(shape.optionalField)).toBe(false);
    });

    it('returns command metadata object', () => {
      expect(SchemaManager.getCommandMetadata(shape.requiredField)).toEqual(
        shape.requiredField
      );
    });

    it('exposes field type names', () => {
      expect(SchemaManager.getFieldTypeName(shape.requiredField)).toBe(
        'string'
      );
      expect(SchemaManager.getFieldTypeName(shape.arrayField)).toBe('array');
      expect(SchemaManager.getFieldTypeName(shape.enumField)).toBe('enum');
    });

    it('returns array element metadata', () => {
      const element = SchemaManager.getArrayElement(shape.arrayField);
      expect(element).toBeDefined();
      expect(element?.type).toBe('string');
    });

    it('returns enum values when present', () => {
      expect(SchemaManager.getEnumValues(shape.enumField)).toEqual(['a', 'b']);
    });
  });

  describe('findEnumValue', () => {
    it('matches case-insensitive values', () => {
      const options = { FOO: 'foo-value', BAR: 'bar-value' };
      expect(SchemaManager.findEnumValue(options, 'foo')).toBe('foo-value');
      expect(SchemaManager.findEnumValue(options, 'baz')).toBe('baz');
    });
  });
});
