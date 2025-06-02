import { Command } from "commander";
import { generateFeature } from "../../generators/feature";
import { GeneratorCommand } from "../../types";
import { validateFeaturePath } from "../../utils/strings";
import { withPathOption } from "../options";

export const featureCommand: GeneratorCommand = {
  name: "feature",
  description: "Generate a new feature",
  register(program: Command) {
    let cmd = program.command("feature").description("Generate a new feature");
    cmd = withPathOption(cmd);
    cmd.action(async (opts) => {
      validateFeaturePath(opts.path);
      generateFeature(opts.path);
    });
  },
};
