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
 * Generates an API handler file and updates feature configuration.
 * @param featurePath - The feature path (can be nested)
 * @param flags - Command line flags and options
 * @param flags.name - The API name (e.g., importProfileApi)
 * @param flags.method - HTTP method (GET, POST, etc.)
 * @param flags.route - HTTP route (e.g., /api/profiles/import)
 * @param flags.entities - List of entity names (optional)
 * @param flags.auth - Whether authentication is required
 * @param flags.force - Whether to overwrite existing files
 */
export async function generateApi(
  featurePath: string,
  flags: {
    name: string;
    method: string;
    route: string;
    entities?: string[];
    auth?: boolean;
    force?: boolean;
  }
): Promise<void> {
  try {
    let baseName = flags.name;
    if (!baseName.endsWith("Api")) {
      baseName = baseName + "Api";
    }
    const apiName = baseName;
    const apiFile = `${apiName}.ts`;
    const ApiType = capitalise(apiName);
    const { method, route, entities = [], auth = false, force = false } = flags;
    const { targetDir: apiDir, importPath } = getFeatureTargetDir(
      featurePath,
      "api"
    );
    ensureDirectoryExists(apiDir);
    const handlerFile = path.join(apiDir, apiFile);
    const fileExists = fs.existsSync(handlerFile);
    if (fileExists && !force) {
      console.log(`API handler file already exists: ${handlerFile}`);
      console.log("Use --force to overwrite");
    } else {
      const AuthCheck = auth
        ? 'if (!context.user || !context.user.id) {\n    res.status(401).json({ error: "Unauthorized" });\n\n    return;\n  }\n'
        : "";
      const templatePath = path.join(
        process.cwd(),
        "scripts",
        "templates",
        "files",
        "server",
        "api.ts"
      );
      if (!fs.existsSync(templatePath)) {
        throw new Error("API handler template not found");
      }
      const template = fs.readFileSync(templatePath, "utf8");
      const processed = processTemplate(template, {
        apiName,
        ApiType,
        AuthCheck,
      });
      fs.writeFileSync(handlerFile, processed);
      console.log(
        `${
          fileExists ? "Overwrote" : "Generated"
        } API handler file: ${handlerFile}`
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
    const configExists = configContent.includes(`${apiName}: {`);
    if (configExists && !force) {
      console.log(`API config already exists in ${configPath}`);
      console.log("Use --force to overwrite");
    } else if (!configExists || force) {
      if (configExists && force) {
        const regex = new RegExp(
          `\\s*${apiName}:\\s*{[^}]*}\\s*[,]?[^}]*}[,]?(?:\\r?\\n)`,
          "g"
        );
        configContent = configContent.replace(regex, "\n");
        configContent = configContent.replace(/\n\s*\n\s*\n/g, "\n\n");
        fs.writeFileSync(configPath, configContent);
      }
      updateFeatureConfig(featurePath, "api", {
        apiName,
        entities,
        method: method.toUpperCase(),
        route,
        apiFile: apiFile.replace(/\.ts$/, ""),
        auth,
      });
      console.log(
        `${configExists ? "Updated" : "Added"} API config in: ${configPath}`
      );
    }
    console.log(`\nAPI ${apiName} processing complete.`);
  } catch (error: any) {
    console.error("Failed to generate API:", error.stack);
    process.exit(1);
  }
}
