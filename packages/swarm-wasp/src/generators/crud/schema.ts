import { CRUD_OPERATIONS, extend } from '@ingenyus/swarm-core';
import { z } from 'zod';
import {
  commonSchemas,
  getTypedArrayTransformer,
  getTypedArrayValidator,
} from '../../utils/schemas';

const validCrudOperations = Object.values(CRUD_OPERATIONS);
const crudOperationsArray = extend(
  z
    .string()
    .optional()
    .refine(getTypedArrayValidator(validCrudOperations), {
      message: `Must be one or more of: ${validCrudOperations.join(', ')}`,
    })
    .transform(getTypedArrayTransformer(validCrudOperations)),
  {
    description: 'Comma-separated list of CRUD operations',
    friendlyName: 'Operations',
    shortName: 'o',
    examples: ['create,read,update', 'get,getAll'],
    helpText: 'Available operations: create, get, getAll, update, delete',
  }
);

export const schema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  public: extend(crudOperationsArray, {
    description: 'Public CRUD operations (accessible without authentication)',
    friendlyName: 'Public Operations',
    shortName: 'b',
    examples: ['get,getAll', 'create,update'],
    helpText: 'Operations that can be accessed without authentication',
  }),
  override: extend(crudOperationsArray, {
    description: 'Override existing CRUD operations',
    friendlyName: 'Override Operations',
    shortName: 'o',
    examples: ['create,update'],
    helpText: 'Operations to override if they already exist',
  }),
  exclude: extend(crudOperationsArray, {
    description: 'Exclude specific CRUD operations from generation',
    friendlyName: 'Exclude Operations',
    shortName: 'x',
    examples: ['delete', 'update,delete'],
    helpText: 'Operations to exclude from generation',
  }),
  force: commonSchemas.force,
});

export type SchemaArgs = z.infer<typeof schema>;
