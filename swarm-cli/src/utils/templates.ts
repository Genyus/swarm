import fs from "fs";
import path from "path";
import { getPlural } from "./strings";

/**
 * Processes a template string by replacing placeholders with values.
 * @param template - The template string
 * @param replacements - Object of placeholder-value pairs
 * @returns The processed template
 */
export function processTemplate(
  template: string,
  replacements: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return result;
}

/**
 * Gets the path to a file template based on its type.
 * @param type - The type of template
 * @param operation - The operation name (for operations)
 * @returns The path to the template file
 * @throws If the file type is unknown
 */
export function getFileTemplatePath(type: string, operation?: string): string {
  const clientTypes = ["component", "hook", "layout", "page", "util"];
  const serverTypes = [
    "action",
    "api",
    "crud",
    "endpoint",
    "job",
    "middleware",
    "query",
    "route",
  ];
  const baseDir = path.join(__dirname, "..", "templates");
  if (clientTypes.includes(type)) {
    return path.join(baseDir, "files", "client", `${type}.tsx`);
  } else if (serverTypes.includes(type)) {
    const templatePath = path.join(baseDir, "files", "server");
    if ((type === "query" || type === "action") && operation) {
      return path.join(templatePath, getPlural(type), `${operation}.ts`);
    }
    return path.join(templatePath, `${type}.ts`);
  } else if (type === "type") {
    return path.join(baseDir, "type.ts");
  }
  throw new Error(`Unknown file type: ${type}`);
}

/**
 * Gets the path to a config template based on its type.
 * @param type - The type of template
 * @returns The path to the template file
 * @throws If the file type is unknown
 */
export function getConfigTemplatePath(type: string): string {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "config",
    `${type}.ts`
  );
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Config template not found for ${type}: ${templatePath}`);
  }
  return templatePath;
}
