import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { handleFatalError } from "../utils/errors";
import { realFileSystem } from "../utils/filesystem";
import { realLogger } from "../utils/logger";
import { createFeatureCommand } from "./commands/feature.command";

/**
 * Main entry point for the generator CLI
 * @function main
 * @returns {Promise<void>} - A promise that resolves when the main function completes
 */
export async function main(): Promise<void> {
  const program = new Command();
  // Explicitly register the feature command
  const featureCmd = createFeatureCommand(realLogger, realFileSystem);
  const featureGenerator = featureCmd.generator;

  program.name("swarm").description("Genyus/Swarm CLI").version("0.1.0");
  featureCmd.register(program, featureGenerator);

  // Dynamically load all other commands except feature.command.ts/js
  const commandsDir = path.join(__dirname, "./commands");
  const files = fs
    .readdirSync(commandsDir)
    .filter(
      (f) =>
        (f.endsWith(".command.ts") || f.endsWith(".command.js")) &&
        !/^feature\.command\.(ts|js)$/.test(f)
    );

  for (const file of files) {
    // Dynamic import (works with both .ts and .js in dev/build)
    // eslint-disable-next-line no-await-in-loop
    const mod = await import(path.join(commandsDir, file));
    for (const key of Object.keys(mod)) {
      // Look for exported functions that start with 'create' and end with 'Command'
      if (typeof mod[key] === "function" && /^create.*Command$/.test(key)) {
        const cmd = mod[key](realLogger, realFileSystem, featureGenerator);
        if (cmd && typeof cmd.register === "function") {
          if ("generator" in cmd) {
            cmd.register(program, cmd.generator);
          } else {
            cmd.register(program);
          }
        }
      }
    }
  }

  await program.parseAsync(process.argv);
}

/**
 * Main entry point for the generator CLI
 * @function main
 * @returns {Promise<void>} - A promise that resolves when the main function completes
 */
if (require.main === module) {
  main().catch((err) => handleFatalError("Swarm CLI failed to start", err));
}
