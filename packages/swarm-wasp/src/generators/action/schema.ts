import { SchemaManager, commandRegistry } from '@ingenyus/swarm';
import { z } from 'zod';
import { commonSchemas } from '../../common';
import { ACTION_OPERATIONS } from '../../types';

const validActions = Object.values(ACTION_OPERATIONS).map(
  (action) => `'${action}'`
);
const actionSchema = z
  .string()
  .min(1, 'Action type is required')
  .transform((val) => SchemaManager.findEnumValue(ACTION_OPERATIONS, val))
  .pipe(
    z.enum(ACTION_OPERATIONS, {
      message: `Invalid action. Must be one of: ${validActions.join(', ')}`,
    })
  )
  .meta({ description: 'The action operation to generate' })
  .register(commandRegistry, {
    shortName: 'o',
    examples: validActions,
    helpText: `Available actions: ${validActions.join(', ')}`,
  });

export const schema = z.object({
  feature: commonSchemas.feature,
  operation: actionSchema,
  dataType: commonSchemas.dataType,
  name: commonSchemas.name
    .optional()
    .meta({
      ...(commonSchemas.name.meta() ?? {}),
      description: `${commonSchemas.name.meta()?.description ?? ''} (optional)`,
    })
    .register(commandRegistry, commandRegistry.get(commonSchemas.name) ?? {}),
  entities: commonSchemas.entities,
  force: commonSchemas.force,
  auth: commonSchemas.auth,
});
