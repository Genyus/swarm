import { Command } from "commander";
import { generateRoute } from "../../generators/route";
import { GeneratorCommand } from "../../types";
import { getRouteNameFromPath } from "../../utils/io";
import { validateFeaturePath, validateRoutePath } from "../../utils/strings";
import {
  withAuthOption,
  withFeatureOption,
  withForceOption,
  withNameOption,
  withPathOption,
} from "../options";

export const routeCommand: GeneratorCommand = {
  name: "route",
  description: "Generate a new route",
  register(program: Command) {
    let cmd = program.command("route").description("Generate a new route");
    cmd = withFeatureOption(cmd);
    cmd = withPathOption(cmd);
    cmd = withNameOption(cmd);
    cmd = withAuthOption(cmd);
    cmd = withForceOption(cmd);
    cmd.action(async (opts) => {
      validateFeaturePath(opts.feature);
      validateRoutePath(opts.path);
      const routeFlags = {
        ...opts,
        name: opts.name || getRouteNameFromPath(opts.path),
        auth: !!opts.auth,
        force: !!opts.force,
      };
      await generateRoute(opts.feature, routeFlags);
    });
  },
};
