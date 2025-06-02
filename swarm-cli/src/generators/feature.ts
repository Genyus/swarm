import fs from "fs";
import path from "path";
import { OPERATION_TYPES, TYPE_DIRECTORIES } from "../types";
import { success } from "../utils/errors";
import {
  copyDirectory,
  ensureDirectoryExists,
  featureExists,
  getConfigDir,
  getFeatureDir,
  getFeatureImportPath,
} from "../utils/io";
import { getPlural, validateFeaturePath } from "../utils/strings";
import { getConfigTemplatePath, processTemplate } from "../utils/templates";

/**
 * Generates a route definition for the feature configuration.
 */
function getRouteDefinition(
  routeName: string,
  routePath: string,
  componentName: string,
  featurePath: string,
  auth = false
): string {
  const featureDir = getFeatureImportPath(featurePath);
  const templatePath = getConfigTemplatePath("route");
  const template = fs.readFileSync(templatePath, "utf8");
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
function getOperationDefinition(
  operationName: string,
  featurePath: string,
  entities: string[],
  operationType: "query" | "action"
): string {
  if (!OPERATION_TYPES.includes(operationType)) {
    throw new Error(`Unknown operation type: ${operationType}`);
  }
  const directory = TYPE_DIRECTORIES[operationType];
  const featureDir = getFeatureImportPath(featurePath);
  const templatePath = getConfigTemplatePath("operation");
  const template = fs.readFileSync(templatePath, "utf8");
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
function getJobDefinition(
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
  const template = fs.readFileSync(templatePath, "utf8");
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
function getApiDefinition(
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
  const template = fs.readFileSync(templatePath, "utf8");
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
function getApiNamespaceDefinition(
  namespaceName: string,
  middlewareFnName: string,
  middlewareImportPath: string,
  pathValue: string
): string {
  const templatePath = getConfigTemplatePath("apiNamespace");
  const template = fs.readFileSync(templatePath, "utf8");
  return processTemplate(template, {
    namespaceName,
    middlewareFnName,
    middlewareImportPath,
    pathValue,
  });
}

/**
 * Updates or creates a feature configuration file with new definitions.
 */
export function updateFeatureConfig(
  featurePath: string,
  type: string,
  options: Record<string, any> = {}
): string {
  const topLevelFeature = featurePath.split("/")[0];
  const configDir = getConfigDir();
  const configPath = path.join(configDir, `${topLevelFeature}.wasp.ts`);
  if (!fs.existsSync(configPath)) {
    const templatePath = path.join(
      process.cwd(),
      "scripts",
      "templates",
      "config",
      "feature.wasp.ts"
    );
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Feature config template not found: ${templatePath}`);
    }
    fs.copyFileSync(templatePath, configPath);
  }
  let content = fs.readFileSync(configPath, "utf8");
  let configSection: string;
  let definition: string;
  switch (type) {
    case "route": {
      configSection = "routes";
      const {
        path: routePath,
        componentName,
        routeName,
        auth = false,
      } = options;
      definition = getRouteDefinition(
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
      definition = getOperationDefinition(
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
      definition = getJobDefinition(
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
      definition = getApiDefinition(
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
      definition = getApiNamespaceDefinition(
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
      const template = fs.readFileSync(templatePath, "utf8");
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
      throw new Error(`Unknown configuration type: ${type}`);
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
  fs.writeFileSync(configPath, content);
  return configPath;
}

/**
 * Generates a feature configuration file for a top-level feature.
 */
export function generateFeatureConfig(featureName: string): void {
  const configDir = getConfigDir();
  ensureDirectoryExists(configDir);
  const configPath = path.join(configDir, `${featureName}.wasp.ts`);
  const templatePath = path.join(
    process.cwd(),
    "scripts",
    "templates",
    "config",
    "feature.wasp.ts"
  );
  if (!fs.existsSync(templatePath)) {
    throw new Error("Feature config template not found");
  }
  fs.copyFileSync(templatePath, configPath);
  success(`Generated feature config: ${configPath}`);
}

/**
 * Generates a new feature at the specified path.
 */
export function generateFeature(featurePath: string): void {
  const segments = validateFeaturePath(featurePath);
  if (segments.length > 1) {
    const parentPath = segments.slice(0, -1).join("/");
    if (!featureExists(parentPath)) {
      throw new Error(
        `Parent feature '${parentPath}' does not exist. Please create it first.`
      );
    }
  }
  const templateDir = path.join(
    process.cwd(),
    "scripts",
    "templates",
    "feature",
    segments.length === 1 ? "" : "_core"
  );
  const featureDir = getFeatureDir(featurePath);
  copyDirectory(templateDir, featureDir);
  if (segments.length === 1) {
    generateFeatureConfig(featurePath);
  }
  success(
    `Generated ${
      segments.length === 1 ? "top-level " : "sub-"
    }feature: ${featurePath}`
  );
}
