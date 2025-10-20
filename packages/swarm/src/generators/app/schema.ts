import { z } from 'zod';
import { extend } from '../../common/schema';

export const schema = z.object({
  name: extend(z.string().min(1, 'Project name is required'), {
    description: 'Project name (will be used for directory and package name)',
    friendlyName: 'Project Name',
    shortName: 'n',
    examples: ['my-app', 'awesome-project'],
  }),
  template: extend(z.string().min(1, 'Template is required'), {
    description: 'GitHub repository path or URL to use as template',
    friendlyName: 'Template',
    shortName: 't',
    examples: ['genyus/swarm-wasp-starter', 'user/repo#branch'],
  }),
  targetDir: extend(z.string().optional(), {
    description: 'Target directory (defaults to project name)',
    friendlyName: 'Target Directory',
    shortName: 'd',
    examples: ['./my-app', '../projects/app'],
  }),
});

export type SchemaArgs = z.infer<typeof schema>;
