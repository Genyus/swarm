import { OPERATIONS, OperationConfigEntry, OperationFlags } from '../types';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import { EntityMetadata } from '../types/prisma';
import { handleFatalError } from '../utils/errors';
import {
  copyDirectory,
  ensureDirectoryExists,
  getConfigDir,
  getFeatureTargetDir,
} from '../utils/io';
import {
  generateJsonTypeHandling,
  getEntityMetadata,
  getIdField,
  getJsonFields,
  getOmitFields,
  needsPrismaImport,
} from '../utils/prisma';
import { getPlural } from '../utils/strings';
import { getFileTemplatePath, processTemplate } from '../utils/templates';

export class OperationGenerator implements NodeGenerator<OperationFlags> {
  constructor(
    public logger: Logger,
    public fs: IFileSystem,
    private featureGenerator: IFeatureGenerator
  ) {}

  async generate(featurePath: string, flags: OperationFlags): Promise<void> {
    try {
      const dataType = flags.dataType;
      const operationType = flags.operation;
      const entities = flags.entities
        ? Array.isArray(flags.entities)
          ? flags.entities
          : flags.entities
              .split(',')
              .map((e: string) => e.trim())
              .filter(Boolean)
        : [];
      const { operationCode, configEntry, operationName } =
        await this.generateOperationComponents(
          dataType,
          operationType,
          flags.auth,
          entities
        );
      const { targetDir: operationsDir, importPath } = getFeatureTargetDir(
        featurePath,
        operationType
      );
      ensureDirectoryExists(this.fs, operationsDir);
      const operationFile = `${operationsDir}/${operationName}.ts`;
      const fileExists = this.fs.existsSync(operationFile);
      if (fileExists && !flags.force) {
        this.logger.info(`Operation file already exists: ${operationFile}`);
        this.logger.info('Use --force to overwrite');
      } else {
        this.fs.writeFileSync(operationFile, operationCode);
        this.logger.success(
          `${
            fileExists ? 'Overwrote' : 'Generated'
          } operation file: ${operationFile}`
        );
      }
      const configPath = `${getConfigDir()}/${
        featurePath.split('/')[0]
      }.wasp.ts`;
      if (!this.fs.existsSync(configPath)) {
        this.logger.error(`Feature config file not found: ${configPath}`);
        return;
      }
      let configContent = this.fs.readFileSync(configPath, 'utf8');
      const configExists = configContent.includes(`${operationName}: {`);
      if (configExists && !flags.force) {
        this.logger.info(`Operation config already exists in ${configPath}`);
        this.logger.info('Use --force to overwrite');
      } else if (!configExists || flags.force) {
        if (configExists && flags.force) {
          const regex = new RegExp(
            `\\s*${operationName}:\\s*{[^}]*}\\s*[,]?[^}]*}[,]?(?:\\r?\\n)`,
            'g'
          );
          configContent = configContent.replace(regex, '\n');
          configContent = configContent.replace(/\n\s*\n\s*\n/g, '\n\n');
          this.fs.writeFileSync(configPath, configContent);
        }
        this.featureGenerator.updateFeatureConfig(featurePath, operationType, {
          ...configEntry,
          importPath,
          entities,
        });
        this.logger.success(
          `${
            configExists ? 'Updated' : 'Added'
          } ${operationType} config in: ${configPath}`
        );
      }
      this.logger.info(`\nOperation ${operationName} processing complete.`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.logger.error('Failed to generate operation: ' + error.stack);
    }
  }

  /**
   * Gets the operation name based on operation type and model name.
   */
  getOperationName(operation: string, modelName: string): string {
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
  getOperationTypeName(operation: string, modelName: string): string {
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
        handleFatalError(`Unknown operation type: ${operation}`);
        return '';
    }
  }

  /**
   * Generates import statements for an operation.
   */
  generateImports(
    model: EntityMetadata,
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
        `import type { ${this.getOperationTypeName(
          operation,
          modelName
        )} } from "wasp/server/operations";`
      );
    }
    return imports.join('\n');
  }

  /**
   * Gets the operation type ("query" or "action") for a given operation.
   */
  getOperationType(operation: string): 'query' | 'action' {
    return operation === OPERATIONS.GETALL || operation === OPERATIONS.GET
      ? 'query'
      : 'action';
  }

  /**
   * Generates the code for an operation.
   */
  generateOperationCode(
    model: EntityMetadata,
    operation: string,
    auth = false,
    isCrudOverride = false,
    crudName: string | null = null
  ): string {
    const operationType = this.getOperationType(operation);
    const templatePath = getFileTemplatePath(operationType, operation);
    const template = this.fs.readFileSync(templatePath, 'utf8');
    const idField = getIdField(model);
    const omitFields = getOmitFields(model);
    const jsonFields = getJsonFields(model);
    const pluralModelName = getPlural(model.name);
    const pluralModelNameLower = pluralModelName.toLowerCase();
    const modelNameLower = model.name.toLowerCase();
    const imports = this.generateImports(
      model,
      model.name,
      operation,
      isCrudOverride,
      crudName
    );
    let typeParams = '';
    if (operation === 'create') {
      typeParams = `<Omit<${model.name}, ${omitFields}>, ${model.name}>`;
    } else if (operation === 'update') {
      typeParams = `<{ ${idField.name}: ${idField.tsType} } & Partial<Omit<${model.name}, ${omitFields}>>, ${model.name}>`;
    } else if (operation === 'delete') {
      typeParams = `<{ ${idField.name}: ${idField.tsType} }, void>`;
    } else if (operation === 'get') {
      typeParams = `<{ ${idField.name}: ${idField.tsType} }>`;
    } else if (operation === 'getAll') {
      typeParams = `<void>`;
    }
    let TypeAnnotation = '';
    let SatisfiesType = '';
    if (isCrudOverride && crudName) {
      const opCap = operation.charAt(0).toUpperCase() + operation.slice(1);
      if (operationType === 'action') {
        TypeAnnotation = `: ${crudName}.${opCap}Action${typeParams}`;
      } else {
        TypeAnnotation = '';
      }
      if (operationType === 'query') {
        SatisfiesType = `satisfies ${crudName}.${opCap}Query${typeParams}`;
      } else {
        SatisfiesType = '';
      }
    } else {
      if (operationType === 'action') {
        TypeAnnotation = `: ${this.getOperationTypeName(
          operation,
          model.name
        )}${typeParams}`;
      } else {
        TypeAnnotation = '';
      }
      if (operationType === 'query') {
        SatisfiesType = `satisfies ${this.getOperationTypeName(
          operation,
          model.name
        )}${typeParams}`;
      } else {
        SatisfiesType = '';
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
        ? '  if (!context.user || !context.user.id) {\n    throw new HttpError(401);\n  }\n\n'
        : '',
      modelNameLower,
      PluralModelName: pluralModelName,
      pluralModelNameLower,
      TypeAnnotation,
      SatisfiesType,
    });
  }

  /**
   * Generates an operation with its code and configuration.
   * @param modelName - The name of the model
   * @param operation - The type of operation, e.g. "create", "update", "delete", "get", "getAll"
   * @param auth - Whether authentication is required
   * @param entities - The entities to include in the operation
   * @returns The operation code (e.g. "export const createUser: CreateUserAction = async (context, { input }) => { ... }"), configuration entry (e.g. { operationName: "createUser", operationType: "create", operationCode: "..." }), operation type (e.g. "create"), and operation name (e.g. "createUser")
   */
  async generateOperationComponents(
    modelName: string,
    operation: string,
    auth = false,
    entities = [modelName]
  ): Promise<{
    operationCode: string;
    configEntry: OperationConfigEntry;
    operationType: string;
    operationName: string;
  }> {
    const metadata = await getEntityMetadata(modelName);
    const operationName = this.getOperationName(operation, modelName);
    const operationType = operation;
    const operationCode = this.generateOperationCode(metadata, operation, auth);
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

  /**
   * Copies a directory of operation templates to the target feature directory.
   * @param templateDir - The source template directory
   * @param targetDir - The target feature directory
   */
  public copyOperationTemplates(templateDir: string, targetDir: string): void {
    copyDirectory(this.fs, templateDir, targetDir);
    this.logger.debug(
      `Copied operation templates from ${templateDir} to ${targetDir}`
    );
  }
}
