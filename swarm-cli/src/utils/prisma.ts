import { PrismaClient } from "@prisma/client";

/**
 * Maps Prisma types to TypeScript types.
 * @param type - The Prisma type
 * @returns The corresponding TypeScript type
 */
export function getPrismaToTsType(type: string): string {
  const typeMap: Record<string, string> = {
    String: "string",
    Int: "number",
    Float: "number",
    Boolean: "boolean",
    DateTime: "Date",
    Json: "Prisma.JsonValue",
    BigInt: "bigint",
    Decimal: "Prisma.Decimal",
    Bytes: "Buffer",
  };
  return typeMap[type] || type;
}

/**
 * Gets metadata about a Prisma model.
 * @param modelName - The name of the model
 * @returns The model metadata
 * @throws If the model is not found
 */
export async function getEntityMetadata(modelName: string): Promise<any> {
  const prisma = new PrismaClient();
  // @ts-ignore: _originalClient is not officially typed
  const models = (prisma as any)._originalClient._runtimeDataModel.models;
  const model = models[modelName];
  if (!model) throw new Error(`Model ${modelName} not found`);
  return {
    fields: Object.entries(model.fields).map(
      ([name, field]: [string, any]) => ({
        name: field.name,
        type: field.type,
        tsType: getPrismaToTsType(field.type),
        isRequired: !field.isNullable,
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
export function getIdField(model: any): any {
  const idField = model.fields.find((f: any) => f.isId);
  if (!idField) throw new Error(`No ID field found for model ${model.name}`);
  return idField;
}

/**
 * Gets the fields to omit from create/update operations.
 * @param model - The model metadata
 * @returns The fields to omit as a union type
 */
export function getOmitFields(model: any): string {
  return model.fields
    .filter(
      (f: any) =>
        f.isId ||
        f.isGenerated ||
        f.isUpdatedAt ||
        (f.type === "DateTime" && f.hasDefaultValue)
    )
    .map((f: any) => `"${f.name}"`)
    .join(" | ");
}

/**
 * Gets all JSON fields from a model.
 * @param model - The model metadata
 * @returns Array of JSON field names
 */
export function getJsonFields(model: any): string[] {
  return model.fields
    .filter((f: any) => f.type === "Json")
    .map((f: any) => f.name);
}

/**
 * Generates JSON field handling code.
 * @param jsonFields - Array of JSON field names
 * @returns The generated code for handling JSON fields
 */
export function generateJsonTypeHandling(jsonFields: string[]): string {
  if (jsonFields.length === 0) return "";
  const assignments = jsonFields
    .map(
      (field) =>
        `        ${field}: (data.${field} as Prisma.JsonValue) || Prisma.JsonNull`
    )
    .join(",\n");
  return `,\n${assignments}`;
}

/**
 * Checks if a model needs Prisma import.
 * @param model - The model metadata
 * @returns True if the model needs Prisma import
 */
export function needsPrismaImport(model: any): boolean {
  return model.fields.some(
    (f: any) => f.type === "Json" || f.type === "Decimal"
  );
}
