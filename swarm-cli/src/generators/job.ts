import fs from "fs";
import path from "path";
import {
  ensureDirectoryExists,
  getConfigDir,
  getFeatureTargetDir,
} from "../utils/io";
import { capitalise } from "../utils/strings";
import { processTemplate } from "../utils/templates";
import { updateFeatureConfig } from "./feature";

/**
 * Generates a job worker file and updates feature configuration.
 * @param featurePath - The feature path (can be nested)
 * @param flags - Command line flags and options
 * @param flags.name - The job name (will be suffixed with 'Job' if not present)
 * @param flags.entities - List of entity names (optional)
 * @param flags.schedule - Optional cron schedule
 * @param flags.scheduleArgs - Optional schedule args (JSON string)
 * @param flags.force - Whether to overwrite existing files
 */
export async function generateJob(
  featurePath: string,
  flags: {
    name: string;
    entities?: string[];
    schedule?: string;
    scheduleArgs?: string;
    force?: boolean;
  }
): Promise<void> {
  try {
    let baseName = flags.name;
    if (!baseName.endsWith("Job")) {
      baseName = baseName + "Job";
    }
    const jobName = baseName;
    const jobWorkerName = baseName;
    const jobWorkerFile = baseName;
    const JobType = capitalise(baseName);
    const entitiesList = (flags.entities || []).map((e) => `"${e}"`).join(", ");
    const schedule = flags.schedule;
    const scheduleArgs = flags.scheduleArgs || "{}";
    const cron = schedule;
    const queueName = jobName;

    let imports = `import type { ${JobType} } from 'wasp/server/jobs';\n`;
    if (flags.entities && flags.entities.length > 0) {
      imports += `import { ${flags.entities.join(
        ", "
      )} } from 'wasp/entities';\n`;
    }

    const { targetDir: jobsDir, importPath } = getFeatureTargetDir(
      featurePath,
      "job"
    );
    ensureDirectoryExists(jobsDir);
    const workerFilePath = path.join(jobsDir, `${jobWorkerFile}.ts`);
    const workerExists = fs.existsSync(workerFilePath);
    if (workerExists && !flags.force) {
      console.log(`Job worker file already exists: ${workerFilePath}`);
      console.log("Use --force to overwrite");
    } else {
      const workerTemplatePath = path.join(
        process.cwd(),
        "scripts",
        "templates",
        "files",
        "server",
        "job.ts"
      );
      if (!fs.existsSync(workerTemplatePath)) {
        throw new Error("Job worker template not found");
      }
      let workerTemplate = fs.readFileSync(workerTemplatePath, "utf8");
      const workerCode = processTemplate(workerTemplate, {
        Imports: imports,
        JobType,
        jobWorkerName,
      });
      fs.writeFileSync(workerFilePath, workerCode);
      console.log(
        `${
          workerExists ? "Overwrote" : "Generated"
        } job worker: ${workerFilePath}`
      );
    }

    const segments = featurePath.split("/").filter(Boolean);
    const topLevelFeature = segments[0];
    const configPath = path.join(getConfigDir(), `${topLevelFeature}.wasp.ts`);
    if (!fs.existsSync(configPath)) {
      console.error(`Feature config file not found: ${configPath}`);
      process.exit(1);
    }
    let configContent = fs.readFileSync(configPath, "utf8");
    const configExists = configContent.includes(`${jobName}: {`);
    if (configExists && !flags.force) {
      console.log(`Job config already exists in ${configPath}`);
      console.log("Use --force to overwrite");
      return;
    } else if (configExists && flags.force) {
      // Remove existing job definition (single job entry in jobs object)
      const jobsSectionRegex = /(jobs\s*:\s*{)([\s\S]*?)(^\s*}\s*[},])/m;
      const jobsMatch = configContent.match(jobsSectionRegex);
      if (jobsMatch) {
        let jobsBlock = jobsMatch[2];
        const jobKeyRegex = new RegExp(
          `(\s*${jobName}\s*:\s*{[\s\S]*?^\s*},?)`,
          "m"
        );
        jobsBlock = jobsBlock.replace(jobKeyRegex, "");
        configContent = configContent.replace(
          jobsSectionRegex,
          `$1${jobsBlock}$3`
        );
        fs.writeFileSync(configPath, configContent);
      }
    }
    updateFeatureConfig(featurePath, "job", {
      jobName,
      jobWorkerName,
      jobWorkerFile,
      entitiesList,
      schedule,
      cron,
      args: scheduleArgs,
      importPath,
      queueName,
    });
    console.log(
      `${configExists ? "Updated" : "Added"} job config in: ${configPath}`
    );
    console.log(`\nJob ${jobName} processing complete.`);
  } catch (error: any) {
    console.error("Failed to generate job:", error.stack);
    process.exit(1);
  }
}
