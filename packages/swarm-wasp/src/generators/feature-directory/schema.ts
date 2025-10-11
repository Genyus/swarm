import { z } from 'zod';
import { commonSchemas } from '../../common/schemas';

export const schema = z.object({
  path: commonSchemas.path,
});

export type SchemaArgs = z.infer<typeof schema>;
