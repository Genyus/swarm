import { Command } from "commander";
import { generateApi } from "../../generators/api";
import { GeneratorCommand } from "../../types";
import { validateFeaturePath } from "../../utils/strings";
import {
  withAuthOption,
  withEntitiesOption,
  withFeatureOption,
  withForceOption,
} from "../options";

export const apiCommand: GeneratorCommand = {
  name: "api",
  description: "Generate an API handler",
  register(program: Command) {
    let cmd = program
      .command("api")
      .requiredOption("--name <name>", "API name")
      .requiredOption("--method <method>", "HTTP method (GET, POST, etc.)")
      .requiredOption("--route <route>", "HTTP route (e.g. /api/foo)")
      .description("Generate an API handler");
    cmd = withFeatureOption(cmd);
    cmd = withEntitiesOption(cmd);
    cmd = withAuthOption(cmd);
    cmd = withForceOption(cmd);
    cmd.action(async (opts) => {
      validateFeaturePath(opts.feature);
      await generateApi(opts.feature, {
        name: opts.name,
        method: opts.method,
        route: opts.route,
        entities: opts.entities
          ? opts.entities
              .split(",")
              .map((e: string) => e.trim())
              .filter(Boolean)
          : undefined,
        auth: !!opts.auth,
        force: !!opts.force,
      });
    });
  },
};
