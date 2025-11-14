import { registerSchemaMetadata, SchemaManager } from '@ingenyus/swarm';
import { z } from 'zod/v4';
import {
  commonFieldMetadata,
  commonSchemas,
  CRUD_OPERATIONS,
} from '../../common';

const validCrudOperations = Object.values(CRUD_OPERATIONS);
const publicOperations = getCrudOperationsArray();
const overrideOperations = getCrudOperationsArray();
const excludeOperations = getCrudOperationsArray();

const baseSchema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  dataType: commonSchemas.dataType,
  public: publicOperations,
  override: overrideOperations,
  exclude: excludeOperations,
  force: commonSchemas.force,
});

export const schema = registerSchemaMetadata(baseSchema, {
  fields: {
    feature: commonFieldMetadata.feature,
    name: commonFieldMetadata.name,
    dataType: commonFieldMetadata.dataType,
    public: {
      type: 'array',
      required: false,
      description: 'Public CRUD operations (accessible without authentication)',
      shortName: 'b',
      examples: ["'get'", "'get' 'getAll'"],
      helpText: 'Operations that can be accessed without authentication.',
      elementType: { type: 'string' },
    },
    override: {
      type: 'array',
      required: false,
      description: 'Override existing CRUD operations',
      shortName: 'v',
      examples: ["'create'", "'create' 'update'"],
      helpText: 'Operations that will have overriden implementations',
      elementType: { type: 'string' },
    },
    exclude: {
      type: 'array',
      required: false,
      description: 'Exclude specific CRUD operations from generation',
      shortName: 'x',
      examples: ["'delete'", "'delete' 'update'"],
      helpText: 'Operations to exclude from generation',
      elementType: { type: 'string' },
    },
    force: commonFieldMetadata.force,
  },
});

function getCrudOperationsArray() {
  return z
    .array(
      z
        .string()
        .transform((val) => {
          return SchemaManager.findEnumValue(CRUD_OPERATIONS, val);
        })
        .pipe(
          z.enum(CRUD_OPERATIONS, {
            message: `Must be one or more of: ${validCrudOperations.join(', ')}`,
          })
        )
    )
    .optional();
}
