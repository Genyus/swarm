import { Command } from "commander";
import { CrudGenerator } from "../../generators/crud";
import { NodeGeneratorCommand } from "../../types";
import { IFileSystem } from "../../types/filesystem";
import { IFeatureGenerator, NodeGenerator } from "../../types/generator";
import { Logger } from "../../types/logger";
import { validateFeaturePath } from "../../utils/strings";
import {
    withFeatureOption,
    withForceOption,
    withNameOption,
} from "../options";

export function createCrudCommand(
  logger: Logger,
  fs: IFileSystem,
  featureGenerator: IFeatureGenerator
): NodeGeneratorCommand {
  return {
    name: "crud",
    description: "Generate CRUD endpoints",
    generator: new CrudGenerator(logger, fs, featureGenerator),
    register(program: Command, generator: NodeGenerator) {
      let cmd = program
        .command("crud")
        .option("--public <public>", "Comma-separated public operations")
        .option("--override <override>", "Comma-separated override operations")
        .option("--exclude <exclude>", "Comma-separated excluded operations")
        .description("Generate CRUD endpoints");
      cmd = withFeatureOption(cmd);
      cmd = withNameOption(cmd, "CRUD name");
      cmd = withForceOption(cmd);
      cmd.action(async (opts) => {
        validateFeaturePath(opts.feature);
        await generator.generate(opts.feature, {
          dataType: opts.name,
          public: opts.public
            ? opts.public
                .split(",")
                .map((e: string) => e.trim())
                .filter(Boolean)
            : undefined,
          override: opts.override
            ? opts.override
                .split(",")
                .map((e: string) => e.trim())
                .filter(Boolean)
            : undefined,
          exclude: opts.exclude
            ? opts.exclude
                .split(",")
                .map((e: string) => e.trim())
                .filter(Boolean)
            : undefined,
          force: !!opts.force,
        });
      });
    },
  };
}
