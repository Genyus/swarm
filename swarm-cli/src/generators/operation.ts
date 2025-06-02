import fs from "fs";
import path from "path";
import { OPERATIONS } from "../types";
import {
  ensureDirectoryExists,
  getConfigDir,
  getFeatureTargetDir,
} from "../utils/io";
import {
  generateJsonTypeHandling,
  getEntityMetadata,
  getIdField,
  getJsonFields,
  getOmitFields,
  needsPrismaImport,
} from "../utils/prisma";
import { getPlural } from "../utils/strings";
import { getFileTemplatePath, processTemplate } from "../utils/templates";
import { updateFeatureConfig } from "./feature";

/**
 * Generates operation files and updates feature configuration.
 */
export async function generateOperation(
  command: string,
  flags: {
    feature: string;
    dataType: string;
    operation: string;
    entities?: string;
    force?: boolean;
    auth?: boolean;
  }
): Promise<void> {
  try {
    const featurePath = flags.feature;
    const dataType = flags.dataType;
    const operationType = flags.operation;
    const entities = flags.entities
      ? flags.entities
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean)
      : [];
    const {
      operationCode,
      configEntry,
      operationType: opType,
      operationName,
    } = await generateOperationComponents(
      dataType,
      operationType,
      flags.auth,
      entities
    );
    const { targetDir: operationsDir, importPath } = getFeatureTargetDir(
      featurePath,
      command
    );
    ensureDirectoryExists(operationsDir);
    const operationFile = path.join(operationsDir, `${operationName}.ts`);
    const fileExists = fs.existsSync(operationFile);
    if (fileExists && !flags.force) {
      console.log(`Operation file already exists: ${operationFile}`);
      console.log("Use --force to overwrite");
    } else {
      fs.writeFileSync(operationFile, operationCode);
      console.log(
        `${
          fileExists ? "Overwrote" : "Generated"
        } operation file: ${operationFile}`
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
    const configExists = configContent.includes(`${operationName}: {`);
    if (configExists && !flags.force) {
      console.log(`Operation config already exists in ${configPath}`);
      console.log("Use --force to overwrite");
    } else if (!configExists || flags.force) {
      if (configExists && flags.force) {
        const regex = new RegExp(
          `\\s*${operationName}:\\s*{[^}]*}\\s*[,]?[^}]*}[,]?(?:\\r?\\n)`,
          "g"
        );
        configContent = configContent.replace(regex, "\n");
        configContent = configContent.replace(/\n\s*\n\s*\n/g, "\n\n");
        fs.writeFileSync(configPath, configContent);
      }
      updateFeatureConfig(featurePath, command, {
        ...configEntry,
        importPath,
        entities,
      });
      console.log(
        `${
          configExists ? "Updated" : "Added"
        } ${command} config in: ${configPath}`
      );
    }
    console.log(`\nOperation ${operationName} processing complete.`);
  } catch (error: any) {
    console.error("Failed to generate operation:", error.stack);
    process.exit(1);
  }
}

/**
 * Gets the operation name based on operation type and model name.
 */
function getOperationName(operation: string, modelName: string): string {
  switch (operation) {
    case OPERATIONS.GETALL:
      return `getAll${getPlural(modelName)}`;
    default:
      return `${operation}${modelName}`;
  }
}

/**
 * Gets the TypeScript type name for an operation.
 */
function getOperationTypeName(operation: string, modelName: string): string {
  switch (operation) {
    case OPERATIONS.CREATE:
      return `Create${modelName}`;
    case OPERATIONS.UPDATE:
      return `Update${modelName}`;
    case OPERATIONS.DELETE:
      return `Delete${modelName}`;
    case OPERATIONS.GET:
      return `Get${modelName}`;
    case OPERATIONS.GETALL:
      return `GetAll${getPlural(modelName)}`;
    default:
      throw new Error(`Unknown operation type: ${operation}`);
  }
}

/**
 * Generates import statements for an operation.
 */
function generateImports(
  model: any,
  modelName: string,
  operation: string,
  isCrudOverride = false,
  crudName: string | null = null
): string {
  const imports: string[] = [];
  if (operation === OPERATIONS.CREATE || operation === OPERATIONS.UPDATE) {
    if (needsPrismaImport(model)) {
      imports.push('import { Prisma } from "@prisma/client";');
    }
    imports.push(`import { ${modelName} } from "wasp/entities";`);
  }
  imports.push('import { HttpError } from "wasp/server";');
  if (isCrudOverride && crudName) {
    imports.push(`import type { ${crudName} } from "wasp/server/crud";`);
  } else {
    imports.push(
      `import type { ${getOperationTypeName(
        operation,
        modelName
      )} } from "wasp/server/operations";`
    );
  }
  return imports.join("\n");
}

/**
 * Gets the operation type ("query" or "action") for a given operation.
 */
export function getOperationType(operation: string): "query" | "action" {
  return operation === OPERATIONS.GETALL || operation === OPERATIONS.GET
    ? "query"
    : "action";
}

/**
 * Generates the code for an operation.
 */
export function generateOperationCode(
  model: any,
  operation: string,
  operationName: string,
  auth = false,
  isCrudOverride = false,
  crudName: string | null = null
): string {
  const operationType = getOperationType(operation);
  const templatePath = getFileTemplatePath(operationType, operation);
  const template = fs.readFileSync(templatePath, "utf8");
  const idField = getIdField(model);
  const omitFields = getOmitFields(model);
  const jsonFields = getJsonFields(model);
  const pluralModelName = getPlural(model.name);
  const pluralModelNameLower = pluralModelName.toLowerCase();
  const modelNameLower = model.name.toLowerCase();
  const imports = generateImports(
    model,
    model.name,
    operation,
    isCrudOverride,
    crudName
  );
  let typeParams = "";
  if (operation === "create") {
    typeParams = `<Omit<${model.name}, ${omitFields}>, ${model.name}>`;
  } else if (operation === "update") {
    typeParams = `<{ ${idField.name}: ${idField.tsType} } & Partial<Omit<${model.name}, ${omitFields}>>, ${model.name}>`;
  } else if (operation === "delete") {
    typeParams = `<{ ${idField.name}: ${idField.tsType} }, void>`;
  } else if (operation === "get") {
    typeParams = `<{ ${idField.name}: ${idField.tsType} }>`;
  } else if (operation === "getAll") {
    typeParams = `<void>`;
  }
  let TypeAnnotation = "";
  let SatisfiesType = "";
  if (isCrudOverride && crudName) {
    const opCap = operation.charAt(0).toUpperCase() + operation.slice(1);
    if (operationType === "action") {
      TypeAnnotation = `: ${crudName}.${opCap}Action${typeParams}`;
    } else {
      TypeAnnotation = "";
    }
    if (operationType === "query") {
      SatisfiesType = `satisfies ${crudName}.${opCap}Query${typeParams}`;
    } else {
      SatisfiesType = "";
    }
  } else {
    if (operationType === "action") {
      TypeAnnotation = `: ${getOperationTypeName(
        operation,
        model.name
      )}${typeParams}`;
    } else {
      TypeAnnotation = "";
    }
    if (operationType === "query") {
      SatisfiesType = `satisfies ${getOperationTypeName(
        operation,
        model.name
      )}${typeParams}`;
    } else {
      SatisfiesType = "";
    }
  }
  return processTemplate(template, {
    Imports: imports,
    ModelName: model.name,
    OmitFields: omitFields,
    IdField: idField.name,
    IdType: idField.tsType,
    JsonTypeHandling: generateJsonTypeHandling(jsonFields),
    AuthCheck: auth
      ? "  if (!context.user || !context.user.id) {\n    throw new HttpError(401);\n  }\n\n"
      : "",
    modelNameLower,
    PluralModelName: pluralModelName,
    pluralModelNameLower,
    TypeAnnotation,
    SatisfiesType,
  });
}

/**
 * Generates an operation with its code and configuration.
 */
async function generateOperationComponents(
  modelName: string,
  operation: string,
  auth = false,
  entities = [modelName]
): Promise<{
  operationCode: string;
  configEntry: Record<string, any>;
  operationType: string;
  operationName: string;
}> {
  const metadata = await getEntityMetadata(modelName);
  const operationName = getOperationName(operation, modelName);
  const operationType = operation;
  const operationCode = generateOperationCode(
    metadata,
    operation,
    operationName,
    auth
  );
  const configEntry = {
    operationName,
    entities,
    authRequired: auth,
  };
  return {
    operationCode,
    configEntry,
    operationType,
    operationName,
  };
}
