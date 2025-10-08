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
  relationToFields?: Readonly<string[]>;
  relationFromFields?: Readonly<string[]>;
}

/**
 * Represents metadata for a Prisma entity/model.
 */
export interface EntityMetadata {
  name: string;
  fields: Readonly<EntityField[]>;
}
