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
          field.attributes?.some((attr) => attr.name === 'id') || false;
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
 * Gets the ID field of a model.
 * @param model - The model metadata
 * @returns The ID field metadata
 * @throws If no ID field is found
 */
export function getIdField(model: EntityMetadata): {
  name: string;
  tsType: string;
} {
  const idField = model.fields.find((f) => f.isId);

  if (!idField) throw new Error(`No ID field found for model ${model.name}`);

  return { name: idField.name, tsType: idField.tsType };
}

/**
 * Gets the fields to omit from create/update operations.
 * @param model - The model metadata
 * @returns The fields to omit as a union type
 */
export function getOmitFields(model: EntityMetadata): string {
  return model.fields
    .filter(
      (f) =>
        f.isId ||
        f.isGenerated ||
        f.isUpdatedAt ||
        f.hasDefaultValue ||
        !f.isRequired
    )
    .map((f) => `"${f.name}"`)
    .join(' | ');
}

/**
 * Gets fields that should be optional in create operations.
 * These are fields with default values that are not DateTime.
 * Excludes ID fields, generated fields, and updatedAt fields.
 * @param model - The model metadata
 * @returns Object mapping field names to their TypeScript types
 */
export function getOptionalFields(
  model: EntityMetadata
): Record<string, string> {
  const optionalFields: Record<string, string> = {};

  model.fields.forEach((field) => {
    if (
      ((field.hasDefaultValue && field.type !== 'DateTime') ||
        !field.isRequired) &&
      !field.isId &&
      !field.isGenerated &&
      !field.isUpdatedAt
    ) {
      optionalFields[field.name] = field.tsType;
    }
  });

  return optionalFields;
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
