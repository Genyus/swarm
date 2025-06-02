import fs from "fs";
import path from "path";
import { error, info, success } from '../utils/errors';
import {
    ensureDirectoryExists,
    getConfigDir,
    getFeatureTargetDir,
} from "../utils/io";
import { getFileTemplatePath, processTemplate } from "../utils/templates";
import { updateFeatureConfig } from "./feature";

/**
 * Generates an apiNamespace middleware and updates feature configuration.
 * @param featurePath - The feature path (can be nested)
 * @param flags - Command line flags and options
 * @param flags.name - The apiNamespace name (e.g., api)
 * @param flags.path - The path for the apiNamespace (e.g., /api)
 * @param flags.force - Whether to overwrite existing files
 */
export async function generateApiNamespace(
  featurePath: string,
  flags: {
    name: string;
    path: string;
    force?: boolean;
  }
): Promise<void> {
  try {
    const { name, path: apiPath, force = false } = flags;
    if (!name || !apiPath) {
      throw new Error(
        "Both --name and --path are required for apiNamespace generation"
      );
    }
    const namespaceName = name;
    const middlewareFnName = `${name}Middleware`;
    const { targetDir: middlewareDir, importPath } = getFeatureTargetDir(
      featurePath,
      "middleware"
    );
    ensureDirectoryExists(middlewareDir);
    const middlewareFile = path.join(middlewareDir, `${middlewareFnName}.ts`);
    const fileExists = fs.existsSync(middlewareFile);
    if (fileExists && !force) {
      info(`Middleware file already exists: ${middlewareFile}`);
      info("Use --force to overwrite");
    } else {
      const templatePath = getFileTemplatePath("middleware");
      if (!fs.existsSync(templatePath)) {
        throw new Error("apiNamespace middleware template not found");
      }
      const template = fs.readFileSync(templatePath, "utf8");
      const processed = processTemplate(template, {
        middlewareFnName,
        namespaceName,
      });
      fs.writeFileSync(middlewareFile, processed);
      success(
        `${
          fileExists ? "Overwrote" : "Generated"
        } middleware file: ${middlewareFile}`
      );
    }
    const segments = featurePath.split("/").filter(Boolean);
    const topLevelFeature = segments[0];
    const configPath = path.join(getConfigDir(), `${topLevelFeature}.wasp.ts`);
    if (!fs.existsSync(configPath)) {
      error(`Feature config file not found: ${configPath}`);
    }
    const middlewareImportPath = `${importPath}/${middlewareFnName}`;
    updateFeatureConfig(featurePath, "apiNamespace", {
      namespaceName,
      middlewareFnName,
      middlewareImportPath,
      path: apiPath,
    });
    success(`Added apiNamespace config in: ${configPath}`);
    success(`\napiNamespace ${namespaceName} processing complete.`);
  } catch (error: any) {
    error("Failed to generate apiNamespace:", error.stack);
  }
}
