import { extend, SchemaManager } from '@ingenyus/swarm';
import { z } from 'zod';
import { commonSchemas } from '../../common';
import { ACTION_OPERATIONS } from '../../types';

const validActions = Object.values(ACTION_OPERATIONS).map(
  (action) => `'${action}'`
);
const actionSchema = extend(
  z
    .string()
    .min(1, 'Action type is required')
    .transform((val) => SchemaManager.findEnumValue(ACTION_OPERATIONS, val))
    .pipe(
      z.enum(ACTION_OPERATIONS, {
        message: `Invalid action. Must be one of: ${validActions.join(', ')}`,
      })
    ),
  {
    description: 'The action operation to generate',
    friendlyName: 'Action Operation',
    shortName: 'o',
    examples: validActions,
    helpText: `Available actions: ${validActions.join(', ')}`,
  }
);

export const schema = z.object({
  feature: commonSchemas.feature,
  operation: actionSchema,
  dataType: commonSchemas.dataType,
  name: extend(commonSchemas.name.optional(), commonSchemas.name._metadata),
  entities: commonSchemas.entities,
  force: commonSchemas.force,
  auth: commonSchemas.auth,
});
