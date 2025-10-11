import { z } from 'zod';
import { commonSchemas } from '../../utils/schemas';

export const schema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  path: commonSchemas.path,
  force: commonSchemas.force,
});

type SchemaArgs = z.infer<typeof schema>;
