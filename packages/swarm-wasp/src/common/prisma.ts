import {
  Break,
  Field,
  getSchema,
  Property,
  type Attribute,
  type AttributeArgument,
  type Block,
  type Comment,
  type KeyValue,
  type Model,
} from '@mrleebo/prisma-ast';
import fs from 'node:fs';
import path from 'node:path';
import type { EntityMetadata } from '../types';

/**
 * Gets metadata about a Prisma model.
 * @param modelName - The name of the model
 * @returns The model metadata
 * @throws If the model is not found or schema cannot be parsed
 */
export async function getEntityMetadata(
  modelName: string
): Promise<EntityMetadata> {
  try {
    const schemaPath = path.join(process.cwd(), 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const schema = getSchema(schemaContent);
    const model = schema.list?.find(
      (m: Block): m is Model => m.type === 'model' && m.name === modelName
    );

    if (!model || model.type !== 'model') {
      throw new Error(`Model ${modelName} not found in schema`);
    }

    // Check for composite primary key (@@id)
    const compositeIdAttr = (model.properties || []).find(
      (item) =>
        item.type === 'attribute' &&
        item.kind === 'object' &&
        item.name === 'id'
    ) as Attribute | undefined;

    let compositeIdFields: string[] = [];
    if (compositeIdAttr?.args?.[0]) {
      const arg = compositeIdAttr.args[0] as AttributeArgument;
      if (
        typeof arg.value === 'object' &&
        arg.value !== null &&
        'type' in arg.value &&
        arg.value.type === 'array' &&
        'args' in arg.value
      ) {
        compositeIdFields = arg.value.args as string[];
      }
    }

    // Filter out array fields and relation fields
    const fields = (model.properties || [])
      .filter(
        (item): item is Field =>
          item.type === 'field' &&
          !item.array &&
          !item.attributes?.some((attr) => attr.name === 'relation')
      )
      .map((field) => {
        const fieldType =
          typeof field.fieldType === 'string'
            ? field.fieldType
            : field.fieldType.name;
        const tsType = getPrismaToTsType(fieldType);
        const isRequired = !field.optional;
        const isId =
          field.attributes?.some((attr) => attr.name === 'id') ||
          compositeIdFields.includes(field.name);
        const isUnique =
          field.attributes?.some((attr) => attr.name === 'unique') || false;
        const hasDefaultValue =
          field.attributes?.some((attr) => attr.name === 'default') || false;
        const isUpdatedAt =
          field.attributes?.some((attr) => attr.name === 'updatedAt') || false;
        const isGenerated =
          field.attributes?.some((attr) => attr.name === 'map') || false;

        return {
          name: field.name,
          type: fieldType,
          tsType,
          isRequired,
          isId,
          isUnique,
          hasDefaultValue,
          isGenerated,
          isUpdatedAt,
        };
      });

    return {
      name: modelName,
      fields,
    };
  } catch (error) {
    throw new Error(
      `Failed to get entity metadata for ${modelName}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Gets the ID fields of a model.
 * Supports both single primary keys (@id) and composite primary keys (@@id).
 * @param model - The model metadata
 * @returns Array of ID field names
 * @throws If no ID field is found
 */
export function getIdFields(model: EntityMetadata): string[] {
  const idFields = model.fields.filter((f) => f.isId).map((f) => f.name);

  if (idFields.length === 0) {
    throw new Error(`No ID field found for model ${model.name}`);
  }

  return idFields;
}

/**
 * Gets fields that are required for create operations.
 * Returns fields that are required, don't have default values,
 * and are not ID, generated, or updatedAt fields.
 * @param model - The model metadata
 * @returns Array of required field names
 */
export function getRequiredFields(model: EntityMetadata): string[] {
  return model.fields
    .filter(
      (f) =>
        f.isRequired &&
        !f.hasDefaultValue &&
        !f.isGenerated &&
        !f.isUpdatedAt
    )
    .map((f) => f.name);
}

/**
 * Gets fields that should be optional in create operations.
 * These are fields with default values that are not DateTime.
 * Excludes ID fields, generated fields, and updatedAt fields.
 * @param model - The model metadata
 * @returns Array of optional field names
 */
export function getOptionalFields(model: EntityMetadata): string[] {
  return model.fields
    .filter(
      (field) =>
        ((field.hasDefaultValue && field.type !== 'DateTime') ||
          !field.isRequired) &&
        !field.isId &&
        !field.isGenerated &&
        !field.isUpdatedAt
    )
    .map((field) => field.name);
}

/**
 * Gets all JSON fields from a model.
 * @param model - The model metadata
 * @returns Array of JSON field names
 */
export function getJsonFields(model: EntityMetadata): string[] {
  return model.fields.filter((f) => f.type === 'Json').map((f) => f.name);
}

/**
 * Generates JSON field handling code.
 * @param jsonFields - Array of JSON field names
 * @returns The generated code for handling JSON fields
 */
export function generateJsonTypeHandling(jsonFields: string[]): string {
  if (jsonFields.length === 0) return '';
  const assignments = jsonFields
    .map(
      (field) =>
        `        ${field}: (data.${field} as Prisma.JsonValue) || Prisma.JsonNull`
    )
    .join(',\n');
  return `,\n${assignments}`;
}

/**
 * Checks if a model needs Prisma import.
 * @param model - The model metadata
 * @returns True if the model needs Prisma import
 */
export function needsPrismaImport(model: EntityMetadata): boolean {
  return model.fields.some((f) => f.type === 'Json' || f.type === 'Decimal');
}

/**
 * Generates a Pick type string for TypeScript.
 * @param modelName - The model name
 * @param fields - Array of field names to pick
 * @param allFields - Array of all field names in the model
 * @returns The Pick type string or simplified type
 */
export function generatePickType(
  modelName: string,
  fields: string[],
  allFields: string[]
): string {
  if (fields.length === 0) return '';

  if (fields.length === allFields.length) return modelName;

  const fieldUnion = fields.map((f) => `"${f}"`).join(' | ');

  return `Pick<${modelName}, ${fieldUnion}>`;
}

/**
 * Generates an Omit type string for TypeScript.
 * @param modelName - The model name
 * @param fields - Array of field names to omit
 * @param allFields - Array of all field names in the model
 * @returns The Omit type string or simplified type
 */
export function generateOmitType(
  modelName: string,
  fields: string[],
  allFields: string[]
): string {
  if (fields.length === 0) return modelName;

  if (fields.length === allFields.length) return '';

  const fieldUnion = fields.map((f) => `"${f}"`).join(' | ');

  return `Omit<${modelName}, ${fieldUnion}>`;
}

/**
 * Generates a Partial type string for TypeScript.
 * @param typeString - The type string to wrap in Partial
 * @returns The Partial type string or empty string
 */
export function generatePartialType(typeString: string): string {
  if (!typeString) return '';

  return `Partial<${typeString}>`;
}

/**
 * Generates an intersection type string for TypeScript.
 * @param type1 - First type string
 * @param type2 - Second type string
 * @returns The intersection type string or simplified type
 */
export function generateIntersectionType(type1: string, type2: string): string {
  if (!type1 && !type2) return '';

  if (!type1) return type2;

  if (!type2) return type1;

  return `${type1} & ${type2}`;
}

/**
 * Maps Prisma types to TypeScript types.
 * @param type - The Prisma type
 * @returns The corresponding TypeScript type
 */
function getPrismaToTsType(type: string): string {
  const typeMap: Record<string, string> = {
    String: 'string',
    Int: 'number',
    Float: 'number',
    Boolean: 'boolean',
    DateTime: 'Date',
    Json: 'Prisma.JsonValue',
    BigInt: 'bigint',
    Decimal: 'Prisma.Decimal',
    Bytes: 'Buffer',
  };

  return typeMap[type] || type;
}
