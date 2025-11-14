import { z } from 'zod/v4';
import { registerSchemaMetadata } from '../../schema';

const baseSchema = z.object({
  name: z
    .string()
    .check(z.minLength(1, { message: 'Project name is required' })),
  template: z
    .string()
    .check(z.minLength(1, { message: 'Template is required' })),
  targetDir: z.optional(z.string()),
});

export const schema = registerSchemaMetadata(baseSchema, {
  fields: {
    name: {
      type: 'string',
      required: true,
      description: 'Project name (will be used for directory and package name)',
      shortName: 'n',
      examples: ['my-app', 'awesome-project'],
    },
    template: {
      type: 'string',
      required: true,
      description: 'GitHub repository path or URL to use as template',
      shortName: 't',
      examples: ['genyus/swarm-wasp-starter', 'user/repo#branch'],
    },
    targetDir: {
      type: 'string',
      required: false,
      description: 'Target directory (defaults to project name)',
      shortName: 'd',
      examples: ['./my-app', '../projects/app'],
    },
  },
});
