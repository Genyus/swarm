import { z } from 'zod';
import { commonSchemas } from '../../common';

export const schema = z.object({
  target: commonSchemas.target,
});
