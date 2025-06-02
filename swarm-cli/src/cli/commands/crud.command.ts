import { Command } from "commander";
import { generateCrud } from "../../generators/crud";
import { GeneratorCommand } from "../../types";
import { validateFeaturePath } from "../../utils/strings";
import { withFeatureOption, withForceOption } from "../options";

export const crudCommand: GeneratorCommand = {
  name: "crud",
  description: "Generate CRUD operations",
  register(program: Command) {
    let cmd = program
      .command("crud")
      .requiredOption("--dataType <dataType>", "Model/type name")
      .option("--public <public>", "Comma-separated public operations")
      .option("--override <override>", "Comma-separated override operations")
      .option("--exclude <exclude>", "Comma-separated excluded operations")
      .description("Generate CRUD operations");
    cmd = withFeatureOption(cmd);
    cmd = withForceOption(cmd);
    cmd.action(async (opts) => {
      validateFeaturePath(opts.feature);
      await generateCrud(opts.feature, {
        dataType: opts.dataType,
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
