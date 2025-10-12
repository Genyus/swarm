/**
 * Represents a field in a Prisma model.
 */
interface EntityField {
  name: string;
  type: string;
  tsType: string;
  isRequired: boolean;
  isId: boolean;
  isUnique: boolean;
  hasDefaultValue: boolean;
  isGenerated: boolean;
  isUpdatedAt: boolean;
}

/**
 * Represents metadata for a Prisma entity/model.
 */
export interface EntityMetadata {
  name: string;
  fields: Readonly<EntityField[]>;
}
