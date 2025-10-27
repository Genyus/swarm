import { extend, SchemaManager } from '@ingenyus/swarm';
import { z } from 'zod';
import { commonSchemas } from '../../common';
import { CRUD_OPERATIONS } from '../../types';

const validCrudOperations = Object.values(CRUD_OPERATIONS);
const publicOperations = getCrudOperationsArray();
const overrideOperations = getCrudOperationsArray();
const excludeOperations = getCrudOperationsArray();

export const schema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  dataType: commonSchemas.dataType,
  public: extend(publicOperations, {
    description: 'Public CRUD operations (accessible without authentication)',
    friendlyName: 'Public Operations',
    shortName: 'b',
    examples: ['get', 'get getAll'],
    helpText: 'Operations that can be accessed without authentication.',
  }),
  override: extend(overrideOperations, {
    description: 'Override existing CRUD operations',
    friendlyName: 'Override Operations',
    shortName: 'v',
    examples: ['create', 'create update'],
    helpText: 'Operations that will have overriden implementations',
  }),
  exclude: extend(excludeOperations, {
    description: 'Exclude specific CRUD operations from generation',
    friendlyName: 'Exclude Operations',
    shortName: 'x',
    examples: ['delete', 'delete update'],
    helpText: 'Operations to exclude from generation',
  }),
  force: commonSchemas.force,
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
