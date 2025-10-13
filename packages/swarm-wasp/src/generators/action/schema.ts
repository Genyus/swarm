import { extend } from '@ingenyus/swarm';
import { z } from 'zod';
import {
  commonSchemas,
  getTypedValueTransformer,
  getTypedValueValidator,
} from '../../common';
import { ACTION_OPERATIONS } from '../../types';

const validActions = Object.values(ACTION_OPERATIONS);

const actionSchema = extend(
  z
    .string()
    .min(1, 'Action type is required')
    .refine(getTypedValueValidator(validActions), {
      message: `Invalid action. Must be one of: ${validActions.join(', ')}`,
    })
    .transform(getTypedValueTransformer(validActions)),
  {
    description: 'The action operation to generate',
    friendlyName: 'Action Operation',
    shortName: 'o',
    examples: validActions,
    helpText: 'Available actions: create, update, delete',
  }
);

const dataTypeSchema = extend(z.string().min(1, 'Data type is required'), {
  description: 'The data type/model name for this action',
  friendlyName: 'Data Type',
  shortName: 'd',
  examples: ['User', 'Product', 'Task'],
  helpText: 'The Wasp entity or model name this action will work with',
});

export const schema = z.object({
  feature: commonSchemas.feature,
  operation: actionSchema,
  dataType: dataTypeSchema,
  name: extend(commonSchemas.name.optional(), commonSchemas.name._metadata),
  entities: commonSchemas.entities,
  force: commonSchemas.force,
  auth: commonSchemas.auth,
});

type SchemaArgs = z.infer<typeof schema>;
