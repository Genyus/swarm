import { registerSchemaMetadata, SchemaManager } from '@ingenyus/swarm';
import { z } from 'zod/v4';
import {
  commonFieldMetadata,
  commonSchemas,
  QUERY_OPERATIONS,
} from '../../common';

const validQueries = Object.values(QUERY_OPERATIONS);
const querySchema = z
  .string()
  .min(1, 'Query type is required')
  .transform((val) => SchemaManager.findEnumValue(QUERY_OPERATIONS, val))
  .pipe(
    z.enum(QUERY_OPERATIONS, {
      message: `Invalid query. Must be one of: ${validQueries.join(', ')}`,
    })
  );

const baseSchema = z.object({
  feature: commonSchemas.feature,
  operation: querySchema,
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
      description: 'The query operation to generate',
      shortName: 'o',
      examples: validQueries,
      helpText: `Available queries: ${validQueries.join(', ')}`,
      enumValues: validQueries,
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
