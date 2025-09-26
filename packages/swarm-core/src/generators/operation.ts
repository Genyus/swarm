import path from 'node:path';
import {
  ActionOperation,
  OPERATIONS,
  OPERATION_TYPES,
  OperationConfigEntry,
  OperationFlags,
  QueryOperation,
  TYPE_DIRECTORIES,
} from '../types';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import { EntityMetadata } from '../types/prisma';
import { handleFatalError } from '../utils/errors';
import {
  copyDirectory,
  ensureDirectoryExists,
  getFeatureDir,
  getFeatureImportPath,
  getFeatureTargetDir,
} from '../utils/filesystem';
import {
  generateJsonTypeHandling,
  getEntityMetadata,
  getIdField,
  getJsonFields,
  getOmitFields,
  needsPrismaImport,
} from '../utils/prisma';
import { capitalise, getPlural, hasHelperMethodCall } from '../utils/strings';
import { TemplateUtility } from '../utils/templates';

export class OperationGenerator implements NodeGenerator<OperationFlags> {
  private templateUtility: TemplateUtility;

  constructor(
    public logger: Logger,
    public fs: IFileSystem,
    private featureGenerator: IFeatureGenerator
  ) {
    this.templateUtility = new TemplateUtility(fs);
    this.logger = logger;
    this.fs = fs;
    this.featureGenerator = featureGenerator;
  }

  async generate(featurePath: string, flags: OperationFlags): Promise<void> {
    try {
      const dataType = flags.dataType;
      const operation = flags.operation;
      const operationType = this.getOperationType(operation);
      const entities = flags.entities
        ? Array.isArray(flags.entities)
          ? flags.entities
          : flags.entities
              .split(',')
              .map((e: string) => e.trim())
              .filter(Boolean)
        : [];
      const { operationCode, operationName } =
        await this.generateOperationComponents(
          dataType,
          operation,
          flags.auth,
          entities
        );
      const { targetDirectory: operationsDir, importDirectory } =
        getFeatureTargetDir(this.fs, featurePath, operationType);
      const importPath = path.join(importDirectory, operationName);

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

      const featureName = featurePath.split('/')[0];
      const featureDir = getFeatureDir(this.fs, featureName);
      const configPath = path.join(featureDir, `${featureName}.wasp.ts`);

      if (!this.fs.existsSync(configPath)) {
        this.logger.error(`Feature config file not found: ${configPath}`);

        return;
      }

      let configContent = this.fs.readFileSync(configPath, 'utf8');
      const isAction = ['create', 'update', 'delete'].includes(operation);
      const methodName = isAction ? 'addAction' : 'addQuery';
      const configExists = hasHelperMethodCall(
        configContent,
        methodName,
        operationName
      );

      if (configExists && !flags.force) {
        this.logger.info(`Operation config already exists in ${configPath}`);
        this.logger.info('Use --force to overwrite');
      } else if (!configExists || flags.force) {
        const isAction = ['create', 'update', 'delete'].includes(operation);
        const definition = this.getDefinition(
          operationName,
          featurePath,
          entities,
          isAction ? 'action' : 'query',
          importPath,
          flags.auth
        );

        this.featureGenerator.updateFeatureConfig(featurePath, definition);
        this.logger.success(
          `${
            configExists ? 'Updated' : 'Added'
          } ${operation} config in: ${configPath}`
        );
      }

      this.logger.info(`\nOperation ${operationName} processing complete.`);
    } catch (error: any) {
      this.logger.error(
        'Failed to generate operation: ' + (error?.stack || error)
      );
    }
  }

  /**
   * Gets the operation name based on operation type and model name.
   */
  getOperationName(
    operation: ActionOperation | QueryOperation,
    modelName: string
  ): string {
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
    operation: ActionOperation | QueryOperation,
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
  getOperationType(
    operation: ActionOperation | QueryOperation
  ): 'query' | 'action' {
    return operation === OPERATIONS.GETALL || operation === OPERATIONS.GET
      ? 'query'
      : 'action';
  }

  /**
   * Generates the operation components needed for file and config generation.
   */
  async generateOperationComponents(
    modelName: string,
    operation: ActionOperation | QueryOperation,
    auth = false,
    entities = [modelName]
  ): Promise<{
    operationCode: string;
    configEntry: OperationConfigEntry;
    operationType: string;
    operationName: string;
  }> {
    const model = await getEntityMetadata(modelName);
    const operationType = this.getOperationType(operation);
    const operationName = this.getOperationName(operation, modelName);
    const operationCode = this.generateOperationCode(model, operation, auth);

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
   * Generates the code for an operation.
   */
  generateOperationCode(
    model: EntityMetadata,
    operation: ActionOperation | QueryOperation,
    auth = false
  ): string {
    const operationType = this.getOperationType(operation);
    const templatePath = this.templateUtility.getFileTemplatePath(
      operationType,
      operation
    );
    const template = this.fs.readFileSync(templatePath, 'utf8');
    const idField = getIdField(model);
    const omitFields = getOmitFields(model);
    const jsonFields = getJsonFields(model);
    const pluralModelName = getPlural(model.name);
    const pluralModelNameLower = pluralModelName.toLowerCase();
    const modelNameLower = model.name.toLowerCase();
    const operationName = this.getOperationName(operation, model.name);
    const imports = this.generateImports(model, model.name, operation);
    const jsonTypeHandling = generateJsonTypeHandling(jsonFields);
    // const imports = generateImports(model, model.name, operation, isCrudOverride, crudName);
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
    const authCheck = auth
      ? `  if (!context.user) {
  throw new HttpError(401);
  }

`
      : '';
    let typeAnnotation = '';
    let satisfiesType = '';
    const isCrudOverride = false;
    const crudName = null;
    if (isCrudOverride && crudName) {
      const opCap = capitalise(operation);
      if (operationType === 'action') {
        typeAnnotation = `: ${crudName}.${opCap}Action${typeParams}`;
      } else {
        typeAnnotation = '';
      }
      if (operationType === 'query') {
        satisfiesType = `satisfies ${crudName}.${opCap}Query${typeParams}`;
      } else {
        satisfiesType = '';
      }
    } else {
      if (operationType === 'action') {
        typeAnnotation = `: ${this.getOperationTypeName(operation, model.name)}${typeParams}`;
      } else {
        typeAnnotation = '';
      }
      if (operationType === 'query') {
        satisfiesType = `satisfies ${this.getOperationTypeName(operation, model.name)}${typeParams}`;
      } else {
        satisfiesType = '';
      }
    }

    const replacements = {
      operationName,
      modelName: model.name,
      authCheck,
      imports,
      idField: idField.name,
      jsonTypeHandling,
      typeAnnotation,
      satisfiesType,
      modelNameLower,
      pluralModelNameLower,
    };

    return this.templateUtility.processTemplate(template, replacements);
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

  /**
   * Generates an operation definition for the feature configuration.
   */
  getDefinition(
    operationName: string,
    featurePath: string,
    entities: string[],
    operationType: 'query' | 'action',
    importPath: string,
    auth = false
  ): string {
    if (!OPERATION_TYPES.includes(operationType)) {
      handleFatalError(`Unknown operation type: ${operationType}`);
    }
    const directory = TYPE_DIRECTORIES[operationType];
    const featureDir = getFeatureImportPath(featurePath);
    const templatePath =
      this.templateUtility.getConfigTemplatePath('operation');
    const template = this.fs.readFileSync(templatePath, 'utf8');

    return this.templateUtility.processTemplate(template, {
      operationType: capitalise(operationType),
      operationName,
      featureDir,
      directory,
      entities: entities.map((e) => `"${e}"`).join(', '),
      importPath,
      auth: String(auth),
    });
  }
}
