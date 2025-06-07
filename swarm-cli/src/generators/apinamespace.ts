import { IFileSystem } from "../types/filesystem";
import { IFeatureGenerator, NodeGenerator } from "../types/generator";
import { Logger } from "../types/logger";
import { ensureDirectoryExists, getFeatureTargetDir } from "../utils/io";
import { getFileTemplatePath, processTemplate } from "../utils/templates";

export class ApiNamespaceGenerator implements NodeGenerator {
  constructor(public logger: Logger, public fs: IFileSystem, private featureGenerator: IFeatureGenerator) {}

  async generate(
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
        this.logger.error(
          "Both --name and --path are required for apiNamespace generation"
        );
        return;
      }
      const namespaceName = name;
      const middlewareFnName = `${name}Middleware`;
      const { targetDir: middlewareDir, importPath } = getFeatureTargetDir(featurePath, "middleware");
      ensureDirectoryExists(this.fs, middlewareDir);
      const middlewareFile = `${middlewareDir}/${middlewareFnName}.ts`;
      const fileExists = this.fs.existsSync(middlewareFile);
      if (fileExists && !force) {
        this.logger.info(`Middleware file already exists: ${middlewareFile}`);
        this.logger.info("Use --force to overwrite");
      } else {
        const templatePath = getFileTemplatePath("middleware");
        if (!this.fs.existsSync(templatePath)) {
          this.logger.error("Middleware template not found");
          return;
        }
        const template = this.fs.readFileSync(templatePath, "utf8");
        const processed = processTemplate(template, {
          middlewareFnName,
          namespaceName,
          apiPath,
        });
        this.fs.writeFileSync(middlewareFile, processed);
        this.logger.success(
          `${fileExists ? "Overwrote" : "Generated"} middleware file: ${middlewareFile}`
        );
      }
      const configPath = `config/${featurePath.split("/")[0]}.wasp.ts`;
      if (!this.fs.existsSync(configPath)) {
        this.logger.error(`Feature config file not found: ${configPath}`);
        return;
      }
      let configContent = this.fs.readFileSync(configPath, "utf8");
      const configExists = configContent.includes(`${namespaceName}: {`);
      if (configExists && !force) {
        this.logger.info(`apiNamespace config already exists in ${configPath}`);
        this.logger.info("Use --force to overwrite");
      } else {
        this.featureGenerator.updateFeatureConfig(featurePath, "apiNamespace", {
          namespaceName,
          middlewareFnName,
          middlewareImportPath: importPath,
          path: apiPath,
        });
        this.logger.success(
          `${configExists ? "Updated" : "Added"} apiNamespace config in: ${configPath}`
        );
      }
      this.logger.success(
        `\napiNamespace ${namespaceName} processing complete.`
      );
    } catch (error: any) {
      this.logger.error("Failed to generate apiNamespace: " + error.stack);
    }
  }
}
