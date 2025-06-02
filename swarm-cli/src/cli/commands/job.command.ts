import { Command } from "commander";
import { generateJob } from "../../generators/job";
import { GeneratorCommand } from "../../types";
import { validateFeaturePath } from "../../utils/strings";
import {
  withEntitiesOption,
  withFeatureOption,
  withForceOption,
  withNameOption,
} from "../options";

export const jobCommand: GeneratorCommand = {
  name: "job",
  description: "Generate a job worker",
  register(program: Command) {
    let cmd = program
      .command("job")
      .option("--schedule <schedule>", "Cron schedule")
      .option("--scheduleArgs <scheduleArgs>", "Schedule args (JSON string)")
      .description("Generate a job worker");
    cmd = withFeatureOption(cmd);
    cmd = withNameOption(cmd);
    cmd = withEntitiesOption(cmd);
    cmd = withForceOption(cmd);
    cmd.action(async (opts) => {
      validateFeaturePath(opts.feature);
      await generateJob(opts.feature, {
        name: opts.name,
        entities: opts.entities
          ? opts.entities
              .split(",")
              .map((e: string) => e.trim())
              .filter(Boolean)
          : undefined,
        schedule: opts.schedule,
        scheduleArgs: opts.scheduleArgs,
        force: !!opts.force,
      });
    });
  },
};
