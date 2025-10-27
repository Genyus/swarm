import { extend, SchemaManager } from '@ingenyus/swarm';
import { z } from 'zod';
import { commonSchemas } from '../../common';
import { QUERY_OPERATIONS } from '../../types';

const validQueries = Object.values(QUERY_OPERATIONS);

const querySchema = extend(
  z
    .string()
    .min(1, 'Query type is required')
    .transform((val) => SchemaManager.findEnumValue(QUERY_OPERATIONS, val))
    .pipe(
      z.enum(QUERY_OPERATIONS, {
        message: `Invalid query. Must be one of: ${validQueries.join(', ')}`,
      })
    ),
  {
    description: 'The query operation to generate',
    friendlyName: 'Query Operation',
    shortName: 'o',
    examples: validQueries,
    helpText: 'Available queries: get, getAll, getFiltered',
  }
);

export const schema = z.object({
  feature: commonSchemas.feature,
  operation: querySchema,
  dataType: commonSchemas.dataType,
  name: extend(commonSchemas.name.optional(), commonSchemas.name._metadata),
  entities: commonSchemas.entities,
  force: commonSchemas.force,
  auth: commonSchemas.auth,
});
