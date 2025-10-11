import { extend } from '@ingenyus/swarm-core';
import { z } from 'zod';
import { ACTION_OPERATIONS, QUERY_OPERATIONS } from '../../types/constants';
import {
  commonSchemas,
  getTypedValueTransformer,
  getTypedValueValidator,
} from '../../common';

const validOperations = [
  ...Object.values(ACTION_OPERATIONS),
  ...Object.values(QUERY_OPERATIONS),
];

const operationSchema = extend(
  z
    .string()
    .min(1, 'Operation is required')
    .refine(getTypedValueValidator(validOperations), {
      message: `Invalid operation. Must be one of: ${validOperations.join(', ')}`,
    })
    .transform(getTypedValueTransformer(validOperations)),
  {
    description: 'The type of operation to generate',
    friendlyName: 'Operation Type',
    shortName: 'o',
    examples: validOperations,
    helpText:
      'Available operations: create, update, delete, get, getAll, getFiltered',
  }
);

const dataTypeSchema = extend(z.string().min(1, 'Data type is required'), {
  description: 'The data type/model name for this operation',
  friendlyName: 'Data Type',
  shortName: 'd',
  examples: ['User', 'Product', 'Task'],
  helpText: 'The Wasp entity or model name this operation will work with',
});

export const schema = z.object({
  feature: commonSchemas.feature,
  operation: operationSchema,
  dataType: dataTypeSchema,
  entities: commonSchemas.entities,
  force: commonSchemas.force,
  auth: commonSchemas.auth,
});

type SchemaArgs = z.infer<typeof schema>;
