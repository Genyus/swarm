import { SchemaManager, commandRegistry } from '@ingenyus/swarm';
import { z } from 'zod';
import { commonSchemas } from '../../common';
import { QUERY_OPERATIONS } from '../../types';

const validQueries = Object.values(QUERY_OPERATIONS);
const querySchema = z
  .string()
  .min(1, 'Query type is required')
  .transform((val) => SchemaManager.findEnumValue(QUERY_OPERATIONS, val))
  .pipe(
    z.enum(QUERY_OPERATIONS, {
      message: `Invalid query. Must be one of: ${validQueries.join(', ')}`,
    })
  )
  .meta({ description: 'The query operation to generate' })
  .register(commandRegistry, {
    shortName: 'o',
    examples: validQueries,
    helpText: `Available queries: ${validQueries.join(', ')}`,
  });

export const schema = z.object({
  feature: commonSchemas.feature,
  operation: querySchema,
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
