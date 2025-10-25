import { z } from 'zod';
import { commonSchemas } from '../../common';

export const schema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  path: commonSchemas.path,
  force: commonSchemas.force,
});

export type ApiNamespaceArgs = z.infer<typeof schema>;
