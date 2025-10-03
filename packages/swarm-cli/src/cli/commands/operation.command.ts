import {
  ACTION_OPERATIONS,
  ActionOperation,
  OperationGenerator,
  QUERY_OPERATIONS,
  QueryOperation,
  validateFeaturePath,
} from '@ingenyus/swarm-core';
import { Command } from 'commander';
import { z } from 'zod';
import { CommandBuilder } from '../command-builder';
import { CommandFactory } from '../command-factory';
import {
  commonSchemas,
  getTypedValueTransformer,
  getTypedValueValidator,
} from '../schemas';

const validOperations = [
  ...Object.values(ACTION_OPERATIONS),
  ...Object.values(QUERY_OPERATIONS),
];

export const operationSchema = z
  .string()
  .min(1, 'Operation is required')
  .refine(getTypedValueValidator(validOperations), {
    message: `Invalid operation. Must be one of: ${validOperations.join(', ')}`,
  })
  .transform(getTypedValueTransformer(validOperations));

const operationCommandSchema = z.object({
  feature: commonSchemas.feature,
  operation: operationSchema,
  dataType: z.string().min(1, 'Data type is required'),
  entities: commonSchemas.entities,
  force: commonSchemas.force,
  auth: commonSchemas.auth,
});

export type OperationCommandArgs = z.infer<typeof operationCommandSchema>;

/**
 * Create an operation (query or action) command using the new CommandFactory system
 * @param commandName - The name of the command
 * @param description - The description of the command
 * @param allowedOperations - The allowed operations
 * @returns The command
 */
function makeOperationCommand({
  commandName,
  description,
  allowedOperations,
}: {
  commandName: string;
  description: string;
  allowedOperations: (ActionOperation | QueryOperation)[];
}): Command {
  const generator = new OperationGenerator();
  const name = commandName;
  const command = CommandFactory.createCommand<OperationCommandArgs>({
    name,
    description,
    schema: operationCommandSchema,
    handler: async (opts: OperationCommandArgs) => {
      validateFeaturePath(opts.feature);
      await generator.generate(opts.feature, {
        dataType: opts.dataType,
        operation: opts.operation,
        entities: opts.entities,
        force: !!opts.force,
        auth: !!opts.auth,
      });
    },
    optionBuilder: (builder: CommandBuilder) =>
      builder
        .withFeature()
        .withEntities()
        .withForce()
        .withAuth()
        .build()
        .requiredOption(
          '-o, --operation <operation>',
          `Operation (${allowedOperations.join(',')})`
        )
        .requiredOption('-d, --data-type <type>', 'Type/model name'),
  });

  return command;
}

export function createActionCommand(): Command {
  return makeOperationCommand({
    commandName: 'action',
    description: 'Generate an action operation',
    allowedOperations: Object.values(ACTION_OPERATIONS) as ActionOperation[],
  });
}

export function createQueryCommand(): Command {
  return makeOperationCommand({
    commandName: 'query',
    description: 'Generate a query operation',
    allowedOperations: Object.values(QUERY_OPERATIONS) as QueryOperation[],
  });
}
