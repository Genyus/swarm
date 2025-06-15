import { defineDmmfProperty } from '@prisma/client/runtime/library';

/**
 * Represents a field in a Prisma model.
 */
export interface EntityField {
  name: string;
  type: string;
  tsType: string;
  isRequired: boolean;
  isId: boolean;
  isUnique: boolean;
  hasDefaultValue: boolean;
  isGenerated: boolean;
  isUpdatedAt: boolean;
  relationName?: string;
  relationToFields?: readonly string[];
  relationFromFields?: readonly string[];
}

/**
 * Represents metadata for a Prisma entity/model.
 */
export interface EntityMetadata {
  name: string;
  fields: EntityField[];
}

/**
 * Represents the runtime data model of a Prisma client.
 */
export type RuntimeDataModel = Parameters<typeof defineDmmfProperty>[1];
