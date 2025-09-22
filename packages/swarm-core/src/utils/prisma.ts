import { PrismaClient } from '@prisma/client';
import { DMMF } from '@prisma/client/runtime/library';
import type { EntityMetadata, RuntimeDataModel } from '../types/prisma';

/**
 * Maps Prisma types to TypeScript types.
 * @param type - The Prisma type
 * @returns The corresponding TypeScript type
 */
export function getPrismaToTsType(type: string): string {
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

/**
 * Gets metadata about a Prisma model.
 * @param modelName - The name of the model
 * @returns The model metadata
 * @throws If the model is not found
 */
export async function getEntityMetadata(
  modelName: string
): Promise<EntityMetadata> {
  const prisma = new PrismaClient();

  const runtimeDataModel = (prisma as any)
    ._runtimeDataModel as RuntimeDataModel;
  const models = runtimeDataModel?.models;

  if (!models) {
    throw new Error('Unable to access Prisma runtime data model');
  }

  const model = models[modelName];
  if (!model) {
    throw new Error(`Model ${modelName} not found`);
  }

  return {
    fields: Object.entries(model.fields).map(
      ([, field]: [string, DMMF.Field]) => ({
        name: field.name,
        type: field.type,
        tsType: getPrismaToTsType(field.type),
        isRequired: field.isRequired,
        isId: field.isId || false,
        isUnique: field.isUnique || false,
        hasDefaultValue: field.hasDefaultValue || false,
        isGenerated: field.isGenerated || false,
        isUpdatedAt: field.isUpdatedAt || false,
        relationName: field.relationName,
        relationToFields: field.relationToFields,
        relationFromFields: field.relationFromFields,
      })
    ),
    name: modelName,
  };
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
        (f.type === 'DateTime' && f.hasDefaultValue)
    )
    .map((f) => `"${f.name}"`)
    .join(' | ');
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
