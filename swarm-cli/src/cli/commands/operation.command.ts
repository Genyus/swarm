import { Command } from "commander";
import { OperationGenerator } from "../../generators/operation";
import {
  ACTION_OPERATIONS,
  NodeGeneratorCommand,
  QUERY_OPERATIONS,
} from "../../types";
import { IFileSystem } from "../../types/filesystem";
import { IFeatureGenerator } from "../../types/generator";
import { Logger } from "../../types/logger";
import { error } from "../../utils/errors";
import { validateFeaturePath } from "../../utils/strings";
import {
  withAuthOption,
  withEntitiesOption,
  withFeatureOption,
  withForceOption,
} from "../options";

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
  allowedOperations: string[];
  logger: Logger;
  fs: IFileSystem;
  featureGenerator: IFeatureGenerator;
}): NodeGeneratorCommand {
  const generator = new OperationGenerator(logger, fs, featureGenerator);
  return {
    name: commandName,
    description,
    generator,
    register(program: Command) {
      let cmd = program
        .command(commandName)
        .requiredOption(
          "--operation <operation>",
          `Operation (${allowedOperations.join(", ")})`
        )
        .requiredOption("--dataType <dataType>", "Model/type name")
        .description(description);
      cmd = withFeatureOption(cmd);
      cmd = withEntitiesOption(cmd);
      cmd = withForceOption(cmd);
      cmd = withAuthOption(cmd);
      cmd.action(async (opts) => {
        validateFeaturePath(opts.feature);
        if (!allowedOperations.includes(opts.operation)) {
          error(
            `--operation flag must be one of: ${allowedOperations.join(", ")}`
          );
          return;
        }
        await generator.generate(opts.feature, {
          feature: opts.feature,
          dataType: opts.dataType,
          operation: opts.operation,
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
): NodeGeneratorCommand {
  return makeOperationCommand({
    commandName: "action",
    description: "Generate an action operation",
    allowedOperations: Object.values(ACTION_OPERATIONS),
    logger,
    fs,
    featureGenerator,
  });
}

export function createQueryCommand(
  logger: Logger,
  fs: IFileSystem,
  featureGenerator: IFeatureGenerator
): NodeGeneratorCommand {
  return makeOperationCommand({
    commandName: "query",
    description: "Generate a query operation",
    allowedOperations: Object.values(QUERY_OPERATIONS),
    logger,
    fs,
    featureGenerator,
  });
}
