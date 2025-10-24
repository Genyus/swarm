import { describe, expect, it } from 'vitest';
import { z, ZodType } from 'zod';
import { SchemaManager } from '.';
import { extend } from './schema';

describe('SchemaManager', () => {
  describe('getShape', () => {
    it('should get shape from valid ZodObject', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const shape = SchemaManager.getShape(schema);

      expect(shape).toBeDefined();
      expect(Object.keys(shape!)).toEqual(['name', 'age']);
    });

    it('should return undefined for non-object schemas', () => {
      const stringSchema = z.string();
      const numberSchema = z.number();

      expect(SchemaManager.getShape(stringSchema)).toBeUndefined();
      expect(SchemaManager.getShape(numberSchema)).toBeUndefined();
    });
  });

  describe('isFieldRequired', () => {
    it('should return true for required fields', () => {
      const requiredString = z.string();
      const requiredNumber = z.number();
      const requiredBoolean = z.boolean();

      expect(SchemaManager.isFieldRequired(requiredString)).toBe(true);
      expect(SchemaManager.isFieldRequired(requiredNumber)).toBe(true);
      expect(SchemaManager.isFieldRequired(requiredBoolean)).toBe(true);
    });

    it('should return false for optional fields', () => {
      const optionalString = z.string().optional();
      const optionalNumber = z.number().optional();

      expect(SchemaManager.isFieldRequired(optionalString)).toBe(false);
      expect(SchemaManager.isFieldRequired(optionalNumber)).toBe(false);
    });
  });

  describe('getFieldMetadata', () => {
    it('should extract metadata from extended schemas', () => {
      const metadata = {
        description: 'Test field',
        friendlyName: 'Test',
        examples: ['example1', 'example2'],
        shortName: 't',
      };

      const extendedSchema = extend(z.string(), metadata);
      const extractedMetadata = SchemaManager.getFieldMetadata(extendedSchema);

      expect(extractedMetadata).toEqual(metadata);
    });

    it('should return undefined for schemas without metadata', () => {
      const regularSchema = z.string();
      const extractedMetadata = SchemaManager.getFieldMetadata(regularSchema);

      expect(extractedMetadata).toBeUndefined();
    });
  });

  describe('getFieldTypeName', () => {
    it('should return correct type name for required fields', () => {
      const stringField = z.string();
      const numberField = z.number();
      const booleanField = z.boolean();

      expect(SchemaManager.getFieldTypeName(stringField)).toBe('string');
      expect(SchemaManager.getFieldTypeName(numberField)).toBe('number');
      expect(SchemaManager.getFieldTypeName(booleanField)).toBe('boolean');
    });

    it('should unwrap optional fields to get inner type', () => {
      const optionalString = z.string().optional();
      const optionalNumber = z.number().optional();

      expect(SchemaManager.getFieldTypeName(optionalString)).toBe('string');
      expect(SchemaManager.getFieldTypeName(optionalNumber)).toBe('number');
    });

    it('should handle complex nested types', () => {
      const arrayField = z.array(z.string());
      const enumField = z.enum(['a', 'b', 'c']);

      expect(SchemaManager.getFieldTypeName(arrayField)).toBe('array');
      expect(SchemaManager.getFieldTypeName(enumField)).toBe('enum');
    });
  });

  describe('integration with real schemas', () => {
    it('should work with a complete schema like those used in generators', () => {
      const schema = z.object({
        name: extend(z.string().min(1), {
          description: 'The name of the resource',
          friendlyName: 'Name',
          shortName: 'n',
          examples: ['users', 'products'],
        }),
        feature: extend(z.string().optional(), {
          description: 'The feature directory',
          friendlyName: 'Feature',
          shortName: 'f',
        }),
        force: extend(z.boolean().optional(), {
          description: 'Force overwrite',
          friendlyName: 'Force',
          shortName: 'F',
        }),
      });

      const shape = SchemaManager.getShape(schema);
      expect(shape).toBeDefined();

      // Test name field (required)
      const nameField = shape!.name as ZodType;
      expect(SchemaManager.isFieldRequired(nameField)).toBe(true);
      expect(SchemaManager.getFieldTypeName(nameField)).toBe('string');
      expect(SchemaManager.getFieldMetadata(nameField)?.description).toBe(
        'The name of the resource'
      );

      // Test feature field (optional)
      const featureField = shape!.feature as ZodType;
      expect(SchemaManager.isFieldRequired(featureField)).toBe(false);
      expect(SchemaManager.getFieldTypeName(featureField)).toBe('string');
      expect(SchemaManager.getFieldMetadata(featureField)?.description).toBe(
        'The feature directory'
      );

      // Test force field (optional boolean)
      const forceField = shape!.force as ZodType;
      expect(SchemaManager.isFieldRequired(forceField)).toBe(false);
      expect(SchemaManager.getFieldTypeName(forceField)).toBe('boolean');
      expect(SchemaManager.getFieldMetadata(forceField)?.description).toBe(
        'Force overwrite'
      );
    });
  });

  describe('getArrayElement', () => {
    it('should return element type for array schemas', () => {
      const arraySchema = z.array(z.string());
      const element = SchemaManager.getArrayElement(arraySchema);

      expect(element).toBeDefined();
      expect(element?._zod.def.type).toBe('string');
    });

    it('should return undefined for non-array schemas', () => {
      const stringSchema = z.string();
      const element = SchemaManager.getArrayElement(stringSchema);

      expect(element).toBeUndefined();
    });
  });

  describe('getEnumValues', () => {
    it('should return enum values for enum schemas', () => {
      const enumSchema = z.enum(['a', 'b', 'c']);
      const values = SchemaManager.getEnumValues(enumSchema);

      expect(values).toEqual(['a', 'b', 'c']);
    });

    it('should return undefined for non-enum schemas', () => {
      const stringSchema = z.string();
      const values = SchemaManager.getEnumValues(stringSchema);

      expect(values).toBeUndefined();
    });
  });

  describe('getOptionalInnerType', () => {
    it('should return inner type for optional schemas', () => {
      const optionalSchema = z.string().optional();
      const innerType = SchemaManager.getInnerType(optionalSchema);

      expect(innerType).toBeDefined();
      expect(innerType?._zod.def.type).toBe('string');
    });

    it('should return undefined for non-optional schemas', () => {
      const stringSchema = z.string();
      const innerType = SchemaManager.getInnerType(stringSchema);

      expect(innerType).toBeUndefined();
    });
  });

  describe('getDefaultInnerType', () => {
    it('should return inner type and default value for default schemas', () => {
      const defaultSchema = z.string().default('hello');
      const result = SchemaManager.getDefaultInnerType(defaultSchema);

      expect(result).toBeDefined();
      expect(result?.innerType._zod.def.type).toBe('string');
      expect(result?.defaultValue).toBe('hello');
    });

    it('should return undefined for non-default schemas', () => {
      const stringSchema = z.string();
      const result = SchemaManager.getDefaultInnerType(stringSchema);

      expect(result).toBeUndefined();
    });
  });
});
