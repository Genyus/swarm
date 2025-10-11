import { extend } from '@ingenyus/swarm-core';
import { z } from 'zod';
import { CRUD_OPERATIONS } from '../../types/constants';
import {
  commonSchemas,
  getTypedArrayTransformer,
  getTypedArrayValidator,
} from '../../common/schemas';

const validCrudOperations = Object.values(CRUD_OPERATIONS);
const publicOperations = getCrudOperationsArray();
const overrideOperations = getCrudOperationsArray();
const excludeOperations = getCrudOperationsArray();

export const schema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  public: extend(publicOperations, {
    description: 'Public CRUD operations (accessible without authentication)',
    friendlyName: 'Public Operations',
    shortName: 'b',
    examples: ['get,getAll', 'create,update'],
    helpText: 'Operations that can be accessed without authentication',
  }),
  override: extend(overrideOperations, {
    description: 'Override existing CRUD operations',
    friendlyName: 'Override Operations',
    shortName: 'o',
    examples: ['create,update'],
    helpText: 'Operations to override if they already exist',
  }),
  exclude: extend(excludeOperations, {
    description: 'Exclude specific CRUD operations from generation',
    friendlyName: 'Exclude Operations',
    shortName: 'x',
    examples: ['delete', 'update,delete'],
    helpText: 'Operations to exclude from generation',
  }),
  force: commonSchemas.force,
});

type SchemaArgs = z.infer<typeof schema>;

function getCrudOperationsArray() {
  return z
    .string()
    .optional()
    .refine(getTypedArrayValidator(validCrudOperations), {
      message: `Must be one or more of: ${validCrudOperations.join(', ')}`,
    })
    .transform(getTypedArrayTransformer(validCrudOperations));
}
