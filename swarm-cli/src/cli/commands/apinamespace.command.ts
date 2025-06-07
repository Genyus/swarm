import { Command } from "commander";
import { ApiNamespaceGenerator } from "../../generators/apinamespace";
import { NodeGeneratorCommand } from "../../types";
import { IFileSystem } from "../../types/filesystem";
import { IFeatureGenerator, NodeGenerator } from "../../types/generator";
import { Logger } from "../../types/logger";
import { validateFeaturePath } from "../../utils/strings";
import {
  withFeatureOption,
  withForceOption,
  withNameOption,
  withPathOption,
} from "../options";

export function createApiNamespaceCommand(
  logger: Logger,
  fs: IFileSystem,
  featureGenerator: IFeatureGenerator
): NodeGeneratorCommand {
  return {
    name: "apinamespace",
    description: "Generate an API namespace",
    generator: new ApiNamespaceGenerator(logger, fs, featureGenerator),
    register(program: Command, generator: NodeGenerator) {
      let cmd = program
        .command("apinamespace")
        .description("Generate an API namespace");
      cmd = withFeatureOption(cmd);
      cmd = withNameOption(cmd, "Namespace name");
      cmd = withPathOption(cmd);
      cmd = withForceOption(cmd);
      cmd.action(async (opts) => {
        validateFeaturePath(opts.feature);
        await generator.generate(opts.feature, {
          name: opts.name,
          path: opts.path,
          force: !!opts.force,
        });
      });
    },
  };
}
