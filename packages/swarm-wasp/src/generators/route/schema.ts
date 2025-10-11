import { z } from 'zod';
import { commonSchemas } from '../../utils/schemas';

export const schema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  path: commonSchemas.path,
  auth: commonSchemas.auth,
  force: commonSchemas.force,
});

type SchemaArgs = z.infer<typeof schema>;
