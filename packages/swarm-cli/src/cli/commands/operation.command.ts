import {
  ACTION_OPERATIONS,
  ActionOperation,
  error,
  IFeatureGenerator,
  IFileSystem,
  Logger,
  OperationFlags,
  OperationGenerator,
  QUERY_OPERATIONS,
  QueryOperation,
  validateFeaturePath,
} from '@ingenyus/swarm-core';
import { Command } from 'commander';
import { NodeGeneratorCommand } from '../../types/commands';
import {
  withAuthOption,
  withEntitiesOption,
  withFeatureOption,
  withForceOption,
} from '../options';

/**
 * Create an operation (query or action) command
 * @param commandName - The name of the command
 * @param description - The description of the command
 * @param allowedOperations - The allowed operations
 * @param logger - Logger instance
 * @param fs - File system instance
 * @param featureGenerator - Feature generator instance
 * @returns The command
 */
function makeOperationCommand({
  commandName,
  description,
  allowedOperations,
  logger,
  fs,
  featureGenerator,
}: {
  commandName: string;
  description: string;
  allowedOperations: (ActionOperation | QueryOperation)[];
  logger: Logger;
  fs: IFileSystem;
  featureGenerator: IFeatureGenerator;
}): NodeGeneratorCommand<OperationFlags> {
  const generator = new OperationGenerator(logger, fs, featureGenerator);
  return {
    name: commandName,
    description,
    generator,
    register(program: Command) {
      let cmd = program
        .command(commandName)
        .requiredOption(
          '--operation <operation>',
          `Operation (${allowedOperations.join(', ')})`
        )
        .requiredOption('--dataType <dataType>', 'Model/type name')
        .description(description);
      cmd = withFeatureOption(cmd);
      cmd = withEntitiesOption(cmd);
      cmd = withForceOption(cmd);
      cmd = withAuthOption(cmd);
      cmd.action(async (opts) => {
        validateFeaturePath(opts.feature);
        const normalizedOperation = opts.operation.toLowerCase() as
          | ActionOperation
          | QueryOperation;
        if (!allowedOperations.includes(normalizedOperation)) {
          error(
            `--operation flag must be one of: ${allowedOperations.join(', ')}`
          );
          return;
        }
        await generator.generate(opts.feature, {
          dataType: opts.dataType,
          operation: normalizedOperation,
          entities: opts.entities,
          force: !!opts.force,
          auth: !!opts.auth,
        });
      });
    },
  };
}

export function createActionCommand(
  logger: Logger,
  fs: IFileSystem,
  featureGenerator: IFeatureGenerator
): NodeGeneratorCommand<OperationFlags> {
  return makeOperationCommand({
    commandName: 'action',
    description: 'Generate an action operation',
    allowedOperations: Object.values(ACTION_OPERATIONS) as ActionOperation[],
    logger,
    fs,
    featureGenerator,
  });
}

export function createQueryCommand(
  logger: Logger,
  fs: IFileSystem,
  featureGenerator: IFeatureGenerator
): NodeGeneratorCommand<OperationFlags> {
  return makeOperationCommand({
    commandName: 'query',
    description: 'Generate a query operation',
    allowedOperations: Object.values(QUERY_OPERATIONS) as QueryOperation[],
    logger,
    fs,
    featureGenerator,
  });
}
