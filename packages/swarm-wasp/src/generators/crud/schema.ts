import { SchemaManager, commandRegistry } from '@ingenyus/swarm';
import { z } from 'zod';
import { commonSchemas, CRUD_OPERATIONS } from '../../common';

const validCrudOperations = Object.values(CRUD_OPERATIONS);
const publicOperations = getCrudOperationsArray();
const overrideOperations = getCrudOperationsArray();
const excludeOperations = getCrudOperationsArray();

export const schema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  dataType: commonSchemas.dataType,
  public: publicOperations
    .meta({
      description: 'Public CRUD operations (accessible without authentication)',
    })
    .register(commandRegistry, {
      shortName: 'b',
      examples: ["'get'", "'get' 'getAll'"],
      helpText: 'Operations that can be accessed without authentication.',
    }),
  override: overrideOperations
    .meta({ description: 'Override existing CRUD operations' })
    .register(commandRegistry, {
      shortName: 'v',
      examples: ["'create'", "'create' 'update'"],
      helpText: 'Operations that will have overriden implementations',
    }),
  exclude: excludeOperations
    .meta({ description: 'Exclude specific CRUD operations from generation' })
    .register(commandRegistry, {
      shortName: 'x',
      examples: ["'delete'", "'delete' 'update'"],
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
