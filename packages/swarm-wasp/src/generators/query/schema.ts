import { extend } from '@ingenyus/swarm';
import { z } from 'zod';
import {
  commonSchemas,
  getTypedValueTransformer,
  getTypedValueValidator,
} from '../../common';
import { QUERY_OPERATIONS } from '../../types';

const validQueries = Object.values(QUERY_OPERATIONS);

const querySchema = extend(
  z
    .string()
    .min(1, 'Query type is required')
    .refine(getTypedValueValidator(validQueries), {
      message: `Invalid query. Must be one of: ${validQueries.join(', ')}`,
    })
    .transform(getTypedValueTransformer(validQueries)),
  {
    description: 'The query operation to generate',
    friendlyName: 'Query Operation',
    shortName: 'o',
    examples: validQueries,
    helpText: 'Available queries: get, getAll, getFiltered',
  }
);

const dataTypeSchema = extend(z.string().min(1, 'Data type is required'), {
  description: 'The data type/model name for this query',
  friendlyName: 'Data Type',
  shortName: 'd',
  examples: ['User', 'Product', 'Task'],
  helpText: 'The Wasp entity or model name this query will work with',
});

export const schema = z.object({
  feature: commonSchemas.feature,
  operation: querySchema,
  dataType: dataTypeSchema,
  name: extend(commonSchemas.name.optional(), commonSchemas.name._metadata),
  entities: commonSchemas.entities,
  force: commonSchemas.force,
  auth: commonSchemas.auth,
});
