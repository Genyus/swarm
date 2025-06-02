import fs from "fs";
import path from "path";
import { handleFatalError, info, success } from '../utils/errors';
import { ensureDirectoryExists, getFeatureTargetDir } from "../utils/io";
import { getEntityMetadata } from "../utils/prisma";
import { getPlural } from "../utils/strings";
import { updateFeatureConfig } from "./feature";
import { generateOperationCode, getOperationType } from "./operation";

const CRUD_OPERATIONS = [
  "get",
  "getAll",
  "create",
  "update",
  "delete",
] as const;

/**
 * Helper to robustly remove a CRUD node from config using brace matching.
 */
function removeCrudNodeFromConfig(
  configContent: string,
  crudName: string
): string {
  const startPattern = new RegExp(`(^|\n)(\s*)${crudName}:\s*{`);
  const match = configContent.match(startPattern);
  if (!match) return configContent;
  let startIndex = (match.index ?? 0) + (match[1] ? match[1].length : 0);
  let braceIndex = configContent.indexOf("{", startIndex);
  let depth = 1;
  let i = braceIndex + 1;
  while (i < configContent.length && depth > 0) {
    if (configContent[i] === "{") depth++;
    else if (configContent[i] === "}") depth--;
    i++;
  }
  let endIndex = i;
  while (
    endIndex < configContent.length &&
    /[\s,]/.test(configContent[endIndex])
  ) {
    endIndex++;
  }
  let lineStart = configContent.lastIndexOf("\n", endIndex - 1);
  if (lineStart !== -1) {
    endIndex = lineStart + 1;
  }
  return configContent.slice(0, startIndex) + configContent.slice(endIndex);
}

/**
 * Generates CRUD operations and updates feature configuration.
 */
export async function generateCrud(
  featurePath: string,
  flags: {
    dataType: string;
    public?: string[];
    override?: string[];
    exclude?: string[];
    force?: boolean;
  }
): Promise<void> {
  try {
    const {
      dataType,
      public: publicOps = [],
      override: overrideOps = [],
      exclude: excludeOps = [],
      force = false,
    } = flags;
    const pluralName = getPlural(dataType);
    const crudName = pluralName;
    const operations: Record<string, any> = {};
    const overrideDirName =
      crudName.charAt(0).toLowerCase() + crudName.slice(1);
    const { targetDir: crudsDir, importPath } = getFeatureTargetDir(
      featurePath,
      "crud"
    );
    ensureDirectoryExists(crudsDir);
    const modelMeta = await getEntityMetadata(dataType);
    const overrideDir = path.join(crudsDir, overrideDirName);
    // Check for config duplication
    const segments = featurePath.split("/").filter(Boolean);
    const topLevelFeature = segments[0];
    const configPath = path.join(
      process.cwd(),
      "config",
      `${topLevelFeature}.wasp.ts`
    );
    let configContent = fs.existsSync(configPath)
      ? fs.readFileSync(configPath, "utf8")
      : "";
    const configExists = new RegExp(`${crudName}:\s*{`).test(configContent);
    if (configExists && !force) {
      info(`CRUD config for '${crudName}' already exists in ${configPath}.`);
      info("Use --force to overwrite");
      return;
    }
    if (force && fs.existsSync(overrideDir)) {
      fs.rmSync(overrideDir, { recursive: true, force: true });
    }
    if (force && configExists) {
      configContent = removeCrudNodeFromConfig(configContent, crudName);
      fs.writeFileSync(configPath, configContent);
    }
    for (const op of CRUD_OPERATIONS) {
      if (excludeOps.includes(op)) continue;
      const opConfig: Record<string, any> = {};
      if (publicOps.includes(op)) opConfig.isPublic = true;
      if (overrideOps.includes(op)) {
        const fnName =
          op === "getAll" ? `getAll${crudName}` : `${op}${dataType}`;
        const fnFile = path.join(overrideDir, `${fnName}.ts`);
        ensureDirectoryExists(path.dirname(fnFile));
        if (!fs.existsSync(fnFile) || force) {
          const operationType = getOperationType(op);
          const operationCode = generateOperationCode(
            modelMeta,
            op,
            fnName,
            false,
            true,
            crudName
          );
          fs.writeFileSync(fnFile, operationCode);
          success(`Generated override: ${fnFile}`);
        } else {
          success(`Override already exists: ${fnFile}`);
        }
        opConfig.overrideFn = {
          import: fnName,
          from: `${importPath}/${overrideDirName}/${fnName}`,
        };
      }
      operations[op] = opConfig;
    }
    const crudConfig = {
      crudName,
      dataType,
      operations,
    };
    updateFeatureConfig(featurePath, "crud", crudConfig);
    success(`Added CRUD config for ${crudName} in feature config.`);
  } catch (error: any) {
    handleFatalError(`Error generating CRUD: ${error.message}`);
  }
}
