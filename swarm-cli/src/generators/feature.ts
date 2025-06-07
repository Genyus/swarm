import path from "path";
import { OPERATION_TYPES, TYPE_DIRECTORIES } from "../types";
import { IFileSystem } from "../types/filesystem";
import { IFeatureGenerator } from "../types/generator";
import { Logger } from "../types/logger";
import { handleFatalError } from "../utils/errors";
import { copyDirectory, getConfigDir, getFeatureImportPath } from "../utils/io";
import { getPlural, validateFeaturePath } from "../utils/strings";
import { getConfigTemplatePath, processTemplate } from "../utils/templates";

export class FeatureGenerator implements IFeatureGenerator {
  constructor(private logger: Logger, private fs: IFileSystem) {}

  /**
   * Generates a route definition for the feature configuration.
   */
  getRouteDefinition(
    routeName: string,
    routePath: string,
    componentName: string,
    featurePath: string,
    auth = false
  ): string {
    const featureDir = getFeatureImportPath(featurePath);
    const templatePath = getConfigTemplatePath("route");
    const template = this.fs.readFileSync(templatePath, "utf8");
    return processTemplate(template, {
      routeName,
      routePath,
      componentName,
      featureDir,
      auth: String(auth),
    });
  }

  /**
   * Generates an operation definition for the feature configuration.
   */
  getOperationDefinition(
    operationName: string,
    featurePath: string,
    entities: string[],
    operationType: "query" | "action"
  ): string {
    if (!OPERATION_TYPES.includes(operationType)) {
      handleFatalError(`Unknown operation type: ${operationType}`);
    }
    const directory = TYPE_DIRECTORIES[operationType];
    const featureDir = getFeatureImportPath(featurePath);
    const templatePath = getConfigTemplatePath("operation");
    const template = this.fs.readFileSync(templatePath, "utf8");
    return processTemplate(template, {
      operationName,
      featureDir,
      directory,
      entities: entities.map((e) => `"${e}"`).join(", "),
    });
  }

  /**
   * Generates a job definition for the feature configuration.
   */
  getJobDefinition(
    jobName: string,
    jobWorkerName: string,
    jobWorkerFile: string,
    entitiesList: string,
    schedule: string,
    cron: string,
    args: string,
    importPath: string,
    queueName: string
  ): string {
    const templatePath = getConfigTemplatePath("job");
    const template = this.fs.readFileSync(templatePath, "utf8");
    return processTemplate(template, {
      jobName,
      jobWorkerName,
      jobWorkerFile,
      entitiesList,
      schedule,
      cron,
      args,
      importPath,
      queueName,
    });
  }

  /**
   * Generates an API definition for the feature configuration.
   */
  getApiDefinition(
    apiName: string,
    featurePath: string,
    entities: string[],
    method: string,
    route: string,
    apiFile: string,
    auth = false
  ): string {
    const featureDir = getFeatureImportPath(featurePath);
    const templatePath = getConfigTemplatePath("api");
    const template = this.fs.readFileSync(templatePath, "utf8");
    return processTemplate(template, {
      apiName,
      featureDir,
      entities: entities.map((e) => `"${e}"`).join(", "),
      method,
      route,
      apiFile,
      auth: String(auth),
    });
  }

  /**
   * Generates an apiNamespace definition for the feature configuration.
   */
  getApiNamespaceDefinition(
    namespaceName: string,
    middlewareFnName: string,
    middlewareImportPath: string,
    pathValue: string
  ): string {
    const templatePath = getConfigTemplatePath("apiNamespace");
    const template = this.fs.readFileSync(templatePath, "utf8");
    return processTemplate(template, {
      namespaceName,
      middlewareFnName,
      middlewareImportPath,
      pathValue,
    });
  }

  /**
   * Updates or creates a feature configuration file with new definitions.
   * @param featurePath - The path of the feature
   * @param type - The type of the configuration
   * @param options - The options for the configuration
   * @returns The path of the configuration file
   */
  public updateFeatureConfig(
    featurePath: string,
    type: string,
    options: Record<string, any> = {}
  ): string {
    const topLevelFeature = featurePath.split("/")[0];
    const configDir = getConfigDir();
    const configPath = path.join(configDir, `${topLevelFeature}.wasp.ts`);
    if (!this.fs.existsSync(configPath)) {
      const templatePath = path.join(
        __dirname,
        "..",
        "templates",
        "config",
        "feature.wasp.ts"
      );
      if (!this.fs.existsSync(templatePath)) {
        handleFatalError(`Feature config template not found: ${templatePath}`);
      }
      this.fs.copyFileSync(templatePath, configPath);
    }
    let content = this.fs.readFileSync(configPath, "utf8");
    let configSection: string = "";
    let definition: string = "";
    switch (type) {
      case "route": {
        configSection = "routes";
        const {
          path: routePath,
          componentName,
          routeName,
          auth = false,
        } = options;
        definition = this.getRouteDefinition(
          routeName,
          routePath,
          componentName,
          featurePath,
          auth
        );
        break;
      }
      case "action":
      case "query": {
        configSection = getPlural(type);
        const { operationName, entities = [] } = options;
        definition = this.getOperationDefinition(
          operationName,
          featurePath,
          entities,
          type
        );
        break;
      }
      case "job": {
        configSection = "jobs";
        const {
          jobName,
          jobWorkerName,
          jobWorkerFile,
          entitiesList = "",
          schedule = "",
          cron = "",
          args = "",
          importPath = "",
          queueName = "",
        } = options;
        definition = this.getJobDefinition(
          jobName,
          jobWorkerName,
          jobWorkerFile,
          entitiesList,
          schedule,
          cron,
          args,
          importPath,
          queueName
        );
        break;
      }
      case "api": {
        configSection = "apis";
        const {
          apiName,
          entities = [],
          method,
          route,
          apiFile,
          auth = false,
        } = options;
        definition = this.getApiDefinition(
          apiName,
          featurePath,
          entities,
          method,
          route,
          apiFile,
          auth
        );
        break;
      }
      case "apiNamespace": {
        configSection = "apiNamespaces";
        const {
          namespaceName,
          middlewareFnName,
          middlewareImportPath,
          path: pathValue,
        } = options;
        definition = this.getApiNamespaceDefinition(
          namespaceName,
          middlewareFnName,
          middlewareImportPath,
          pathValue
        );
        break;
      }
      case "crud": {
        configSection = "cruds";
        const { crudName, dataType, operations } = options;
        const templatePath = getConfigTemplatePath("crud");
        const template = this.fs.readFileSync(templatePath, "utf8");
        const operationsStr = JSON.stringify(operations, null, 2)
          .replace(/"([^"]+)":/g, "$1:")
          .split("\n")
          .map((line, index) => (index === 0 ? line : "        " + line))
          .join("\n");
        definition = processTemplate(template, {
          crudName,
          dataType,
          operations: operationsStr,
        });
        break;
      }
      default:
        handleFatalError(`Unknown configuration type: ${type}`);
    }
    const configBlock = `\n    ${configSection}: {${definition},\n    },`;
    if (content.includes("return {};")) {
      content = content.replace("return {};", `return {${configBlock}\n  };`);
    } else if (!content.includes(`${configSection}:`)) {
      content = content.replace(/return\s*{/, `return {${configBlock}`);
    } else {
      content = content.replace(
        new RegExp(`${configSection}:\\s*{`),
        `${configSection}: {${definition},`
      );
    }
    this.fs.writeFileSync(configPath, content);
    return configPath;
  }

  /**
   * Generates a feature configuration file for a top-level feature.
   * @param featureName - The name of the feature
   */
  public generateFeatureConfig(featureName: string): void {
    const configDir = "config";
    if (!this.fs.existsSync(configDir)) {
      this.fs.writeFileSync(configDir, ""); // placeholder for ensureDirectoryExists
    }
    const configPath = `${configDir}/${featureName}.wasp.ts`;
    const templatePath = path.join(__dirname, "..", "templates", "config", "feature.wasp.ts");
    if (!this.fs.existsSync(templatePath)) {
      handleFatalError("Feature config template not found");
    }
    this.fs.copyFileSync(templatePath, configPath);
    this.logger.success(`Generated feature config: ${configPath}`);
  }

  /**
   * Generates a new feature at the specified path.
   * @param featurePath - The path of the feature
   */
  public generateFeature(featurePath: string): void {
    const segments = validateFeaturePath(featurePath);
    if (segments.length > 1) {
      const parentPath = segments.slice(0, -1).join("/");
      // featureExists logic (simplified)
      if (!this.fs.existsSync(parentPath)) {
        handleFatalError(
          `Parent feature '${parentPath}' does not exist. Please create it first.`
        );
        handleFatalError("Parent feature does not exist");
      }
    }
    const templateDir = path.join(__dirname, "..", "templates", "feature", segments.length === 1 ? "" : "_core");
    const featureDir = `features/${featurePath}`;
    copyDirectory(this.fs, templateDir, featureDir);
    this.logger.debug(`Copied template from ${templateDir} to ${featureDir}`);
    if (segments.length === 1) {
      this.generateFeatureConfig(featurePath);
    }
    this.logger.success(
      `Generated ${
        segments.length === 1 ? "top-level " : "sub-"
      }feature: ${featurePath}`
    );
  }
}
