import { z } from 'zod';
import { commandRegistry } from '../../schema';

export const schema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .meta({
      description: 'Project name (will be used for directory and package name)',
    })
    .register(commandRegistry, {
      shortName: 'n',
      examples: ['my-app', 'awesome-project'],
    }),
  template: z
    .string()
    .min(1, 'Template is required')
    .meta({ description: 'GitHub repository path or URL to use as template' })
    .register(commandRegistry, {
      shortName: 't',
      examples: ['genyus/swarm-wasp-starter', 'user/repo#branch'],
    }),
  targetDir: z
    .string()
    .optional()
    .meta({ description: 'Target directory (defaults to project name)' })
    .register(commandRegistry, {
      shortName: 'd',
      examples: ['./my-app', '../projects/app'],
    }),
});
