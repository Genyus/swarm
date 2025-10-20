import { z } from 'zod';
import { commonSchemas } from '../../common';

export const schema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  path: commonSchemas.path,
  auth: commonSchemas.auth,
  force: commonSchemas.force,
});
