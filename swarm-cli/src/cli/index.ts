import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { GeneratorCommand } from "../types";

/**
 * Main entry point for the generator CLI
 * @function main
 * @returns {Promise<void>} - A promise that resolves when the main function completes
 */
export async function main(): Promise<void> {
  const program = new Command();
  program.name("swarm").description("Genyus/Swarm CLI").version("0.1.0");

  const commandsDir = path.join(__dirname, "../commands");
  const files = fs
    .readdirSync(commandsDir)
    .filter((f) => f.endsWith(".command.ts") || f.endsWith(".command.js"));

  for (const file of files) {
    // Dynamic import (works with both .ts and .js in dev/build)
    // eslint-disable-next-line no-await-in-loop
    const mod = await import(path.join(commandsDir, file));
    for (const key of Object.keys(mod)) {
      const cmd = mod[key];
      if (
        cmd &&
        typeof cmd === "object" &&
        typeof cmd.register === "function"
      ) {
        (cmd as GeneratorCommand).register(program);
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
  main().catch(console.error);
}
