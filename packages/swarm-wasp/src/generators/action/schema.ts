import { SchemaManager, registerSchemaMetadata } from '@ingenyus/swarm';
import { z } from 'zod/v4';
import {
  ACTION_OPERATIONS,
  commonFieldMetadata,
  commonSchemas,
} from '../../common';

const validActions = Object.values(ACTION_OPERATIONS);
const actionSchema = z
  .string()
  .min(1, 'Action type is required')
  .transform((val) => SchemaManager.findEnumValue(ACTION_OPERATIONS, val))
  .pipe(
    z.enum(ACTION_OPERATIONS, {
      message: `Invalid action. Must be one of: ${validActions.join(', ')}`,
    })
  );

const baseSchema = z.object({
  feature: commonSchemas.feature,
  operation: actionSchema,
  dataType: commonSchemas.dataType,
  name: commonSchemas.name.optional(),
  entities: commonSchemas.entities,
  force: commonSchemas.force,
  auth: commonSchemas.auth,
});

export const schema = registerSchemaMetadata(baseSchema, {
  fields: {
    feature: commonFieldMetadata.feature,
    operation: {
      type: 'enum',
      required: true,
      description: 'The action operation to generate',
      shortName: 'o',
      examples: validActions,
      helpText: `Available actions: ${validActions.join(', ')}`,
      enumValues: validActions,
    },
    dataType: commonFieldMetadata.dataType,
    name: {
      ...commonFieldMetadata.name,
      required: false,
      description: `${commonFieldMetadata.name.description} (optional)`,
    },
    entities: commonFieldMetadata.entities,
    force: commonFieldMetadata.force,
    auth: commonFieldMetadata.auth,
  },
});
