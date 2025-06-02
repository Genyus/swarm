import { Command } from "commander";
import { generateOperation } from "../../generators/operation";
import {
  ACTION_OPERATIONS,
  COMMANDS,
  GeneratorCommand,
  QUERY_OPERATIONS,
} from "../../types";
import { error } from '../../utils/errors';
import { validateFeaturePath } from "../../utils/strings";
import {
  withAuthOption,
  withDataTypeOption,
  withEntitiesOption,
  withFeatureOption,
  withForceOption,
} from "../options";

export const actionCommand: GeneratorCommand = {
  name: "action",
  description: "Generate an action operation",
  register(program: Command) {
    let cmd = program
      .command("action")
      .requiredOption(
        "--operation <operation>",
        `Operation (${Object.values(ACTION_OPERATIONS).join(", ")})`
      )
      .description("Generate an action operation");
    cmd = withFeatureOption(cmd);
    cmd = withDataTypeOption(cmd);
    cmd = withEntitiesOption(cmd);
    cmd = withForceOption(cmd);
    cmd = withAuthOption(cmd);
    cmd.action(async (opts) => {
      validateFeaturePath(opts.feature);
      if (!Object.values(ACTION_OPERATIONS).includes(opts.operation)) {
        error(`--operation flag must be one of: ${Object.values(ACTION_OPERATIONS).join(", ")}`);
        return;
      }
      await generateOperation(COMMANDS.ACTION, {
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

export const queryCommand: GeneratorCommand = {
  name: "query",
  description: "Generate a query operation",
  register(program: Command) {
    let cmd = program
      .command("query")
      .requiredOption(
        "--operation <operation>",
        `Operation (${Object.values(QUERY_OPERATIONS).join(", ")})`
      )
      .description("Generate a query operation");
    cmd = withFeatureOption(cmd);
    cmd = withDataTypeOption(cmd);
    cmd = withEntitiesOption(cmd);
    cmd = withForceOption(cmd);
    cmd = withAuthOption(cmd);
    cmd.action(async (opts) => {
      validateFeaturePath(opts.feature);
      if (!Object.values(QUERY_OPERATIONS).includes(opts.operation)) {
        error(`--operation flag must be one of: ${Object.values(QUERY_OPERATIONS).join(", ")}`);
        return;
      }
      await generateOperation(COMMANDS.QUERY, {
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
