import { registerSchemaMetadata } from '@ingenyus/swarm';
import { z } from 'zod/v4';
import { commonFieldMetadata, commonSchemas } from '../../common';

const baseSchema = z.object({
  target: commonSchemas.target,
});

export const schema = registerSchemaMetadata(baseSchema, {
  fields: {
    target: commonFieldMetadata.target,
  },
});
