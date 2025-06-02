import fs from "fs";
import path from "path";
import { error, info, success } from '../utils/errors';
import {
  ensureDirectoryExists,
  getConfigDir,
  getFeatureTargetDir,
  getRouteNameFromPath,
} from "../utils/io";
import { formatDisplayName } from "../utils/strings";
import { processTemplate } from "../utils/templates";
import { updateFeatureConfig } from "./feature";

/**
 * Generates a route with its page component and configuration.
 * @param featurePath - The feature path (can be nested)
 * @param flags - Command line flags and options
 * @param flags.path - The URL path for the route
 * @param flags.name - Optional component name (derived from path if not provided)
 * @param flags.force - Whether to overwrite existing files
 * @param flags.auth - Whether authentication is required
 */
export async function generateRoute(
  featurePath: string,
  flags: {
    path: string;
    name?: string;
    force?: boolean;
    auth?: boolean;
  }
): Promise<void> {
  try {
    const { path: routePath, name, auth, force } = flags;
    // Generate component name from path if not provided
    const componentName = name || getRouteNameFromPath(routePath);
    const routeName = `${
      componentName.endsWith("Page")
        ? componentName.slice(0, -4)
        : componentName
    }Route`;

    // Get the appropriate directory for the page component
    const { targetDir: pagesDir, importPath } = getFeatureTargetDir(
      featurePath,
      "page"
    );
    ensureDirectoryExists(pagesDir);
    const pageFile = path.join(pagesDir, `${componentName}.tsx`);
    const fileExists = fs.existsSync(pageFile);

    if (fileExists && !force) {
      info(`Page file already exists: ${pageFile}`);
      info("Use --force to overwrite");
    } else {
      // Generate the page component
      const templatePath = path.join(
        process.cwd(),
        "scripts",
        "templates",
        "files",
        "client",
        "page.tsx"
      );
      if (!fs.existsSync(templatePath)) {
        throw new Error("Page template not found");
      }
      const template = fs.readFileSync(templatePath, "utf8");
      const replacements = {
        ComponentName: componentName,
        DisplayName: formatDisplayName(componentName),
      };
      const processed = processTemplate(template, replacements);
      fs.writeFileSync(pageFile, processed);
      success(`${fileExists ? "Overwrote" : "Generated"} page file: ${pageFile}`);
    }

    // Get the top-level feature name for config updates
    const segments = featurePath.split("/").filter(Boolean);
    const topLevelFeature = segments[0];

    // Update config in the top-level feature's config file
    const configPath = path.join(getConfigDir(), `${topLevelFeature}.wasp.ts`);
    if (!fs.existsSync(configPath)) {
      error(`Feature config file not found: ${configPath}`);
    }
    let configContent = fs.readFileSync(configPath, "utf8");
    // Look for the route definition in the format "pageName: {"
    const configExists = configContent.includes(`${componentName}: {`);
    if (configExists && !force) {
      info(`Route config already exists in ${configPath}`);
      info("Use --force to overwrite");
    } else if (!configExists || force) {
      if (configExists && force) {
        // Remove existing route definition including the closing brace on its own line
        const regex = new RegExp(
          `\\s*${componentName}:\\s*{[^}]*}\\s*[,]?[^}]*}[,]?(?:\\r?\\n)`,
          "g"
        );
        configContent = configContent.replace(regex, "\n");
        // Clean up any double newlines that might have been left behind
        configContent = configContent.replace(/\n\s*\n\s*\n/g, "\n\n");
        fs.writeFileSync(configPath, configContent);
      }
      // Update feature config with new route
      updateFeatureConfig(featurePath, "route", {
        path: routePath,
        componentName,
        routeName,
        importPath,
        auth,
      });
      success(`${configExists ? "Updated" : "Added"} route config in: ${configPath}`);
    }
    info(`\nRoute ${routeName} processing complete.`);
  } catch (error: any) {
    error("Failed to generate route:", error.stack);
  }
}
