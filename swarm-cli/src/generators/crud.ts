import { IFileSystem } from "../types/filesystem";
import { IFeatureGenerator, NodeGenerator } from "../types/generator";
import { Logger } from "../types/logger";
import { ensureDirectoryExists, getFeatureTargetDir } from "../utils/io";
import { getFileTemplatePath, processTemplate } from "../utils/templates";

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

export class CrudGenerator implements NodeGenerator {
  constructor(public logger: Logger, public fs: IFileSystem, private featureGenerator: IFeatureGenerator) {}

  async generate(
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
      const { dataType, force } = flags;
      const pluralName = dataType.endsWith("y")
        ? `${dataType.slice(0, -1)}ies`
        : `${dataType}s`;
      const crudName = pluralName;
      const { targetDir: crudsDir, importPath } = getFeatureTargetDir(featurePath, "crud");
      ensureDirectoryExists(this.fs, crudsDir);
      const crudFile = `${crudsDir}/${crudName}.ts`;
      const fileExists = this.fs.existsSync(crudFile);
      if (fileExists && !force) {
        this.logger.info(`CRUD file already exists: ${crudFile}`);
        this.logger.info("Use --force to overwrite");
        return;
      }
      // Use template for CRUD file
      const templatePath = getFileTemplatePath("crud");
      if (!this.fs.existsSync(templatePath)) {
        this.logger.error("CRUD template not found");
        return;
      }
      const template = this.fs.readFileSync(templatePath, "utf8");
      const crudCode = processTemplate(template, {
        crudName,
        dataType,
        operations: JSON.stringify(CRUD_OPERATIONS, null, 2),
      });
      this.fs.writeFileSync(crudFile, crudCode);
      this.logger.success(
        `${fileExists ? "Overwrote" : "Generated"} CRUD file: ${crudFile}`
      );
      const configPath = `config/${featurePath.split("/")[0]}.wasp.ts`;
      if (!this.fs.existsSync(configPath)) {
        this.logger.error(`Feature config file not found: ${configPath}`);
        return;
      }
      let configContent = this.fs.readFileSync(configPath, "utf8");
      const configExists = configContent.includes(`${crudName}: {`);
      if (configExists && !force) {
        this.logger.info(`CRUD config already exists in ${configPath}`);
        this.logger.info("Use --force to overwrite");
        return;
      }
      this.featureGenerator.updateFeatureConfig(featurePath, "crud", {
        crudName,
        dataType,
        operations: CRUD_OPERATIONS,
        importPath,
      });
      this.logger.success(
        `${configExists ? "Updated" : "Added"} CRUD config in: ${configPath}`
      );
      this.logger.info(`\nCRUD ${crudName} processing complete.`);
    } catch (error: any) {
      this.logger.error("Failed to generate CRUD: " + error.stack);
    }
  }
}
