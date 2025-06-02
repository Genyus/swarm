import { Command } from "commander";
import { generateApiNamespace } from "../../generators/apinamespace";
import { GeneratorCommand } from "../../types";
import { validateFeaturePath } from "../../utils/strings";
import {
  withFeatureOption,
  withForceOption,
  withNameOption,
  withPathOption,
} from "../options";

export const apinamespaceCommand: GeneratorCommand = {
  name: "apinamespace",
  description: "Generate an API namespace middleware",
  register(program: Command) {
    let cmd = program
      .command("apinamespace")
      .description("Generate an API namespace middleware");
    cmd = withFeatureOption(cmd);
    cmd = withNameOption(cmd);
    cmd = withPathOption(cmd);
    cmd = withForceOption(cmd);
    cmd.action(async (opts) => {
      validateFeaturePath(opts.feature);
      await generateApiNamespace(opts.feature, {
        name: opts.name,
        path: opts.path,
        force: !!opts.force,
      });
    });
  },
};
