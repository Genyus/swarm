import {
  CRUD_OPERATIONS,
  CrudGenerator,
  validateFeaturePath,
} from '@ingenyus/swarm-core';
import { Command } from 'commander';
import { z } from 'zod';
import { CommandBuilder } from '../command-builder';
import { CommandFactory } from '../command-factory';
import {
  commonSchemas,
  getTypedArrayTransformer,
  getTypedArrayValidator,
} from '../schemas';

const validCrudOperations = Object.values(CRUD_OPERATIONS);

export const crudOperationsArray = z
  .string()
  .optional()
  .refine(getTypedArrayValidator(validCrudOperations), {
    message: `Must be one or more of: ${validCrudOperations.join(', ')}`,
  })
  .transform(getTypedArrayTransformer(validCrudOperations));
export const crudCommandSchema = z.object({
  feature: commonSchemas.feature,
  name: commonSchemas.name,
  public: crudOperationsArray,
  override: crudOperationsArray,
  exclude: crudOperationsArray,
  force: commonSchemas.force,
});

export type CrudCommandArgs = z.infer<typeof crudCommandSchema>;

/**
 * Create a CRUD command using the new CommandFactory system
 * @returns The command
 */
export function createCrudCommand(): Command {
  const generator = new CrudGenerator();
  const name = 'crud';
  const description = 'Generate CRUD operations';

  return CommandFactory.createCommand<CrudCommandArgs>({
    name,
    description,
    schema: crudCommandSchema,
    handler: async (opts: CrudCommandArgs) => {
      validateFeaturePath(opts.feature);
      await generator.generate(opts.feature, {
        dataType: opts.name,
        public: opts.public,
        override: opts.override,
        exclude: opts.exclude,
        force: !!opts.force,
      });
    },
    optionBuilder: (builder: CommandBuilder) =>
      builder
        .withFeature()
        .withName('CRUD name')
        .withForce()
        .build()
        .option('-b, --public <public>', 'Comma-separated public operations')
        .option(
          '-o, --override <override>',
          'Comma-separated override operations'
        )
        .option(
          '-x, --exclude <exclude>',
          'Comma-separated excluded operations'
        ),
  });
}
