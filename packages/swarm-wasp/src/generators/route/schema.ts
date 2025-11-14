import { registerSchemaMetadata } from '@ingenyus/swarm';
import { z } from 'zod/v4';
import { commonFieldMetadata, commonSchemas } from '../../common';

const baseSchema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  path: commonSchemas.path,
  auth: commonSchemas.auth,
  force: commonSchemas.force,
});

export const schema = registerSchemaMetadata(baseSchema, {
  fields: {
    feature: commonFieldMetadata.feature,
    name: commonFieldMetadata.name,
    path: commonFieldMetadata.path,
    auth: commonFieldMetadata.auth,
    force: commonFieldMetadata.force,
  },
});
