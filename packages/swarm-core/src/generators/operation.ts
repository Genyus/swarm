import path from 'node:path';
import {
  ActionOperation,
  OPERATIONS,
  OPERATION_TYPES,
  OperationConfigEntry,
  OperationFlags,
  OperationType,
  QueryOperation,
  TYPE_DIRECTORIES,
} from '../types';
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
import {
  capitalise,
  getPlural,
  hasHelperMethodCall,
  toPascalCase,
} from '../utils/strings';
import { BaseGenerator } from './base';

export class OperationGenerator extends BaseGenerator<OperationFlags> {
  async generate(featurePath: string, flags: OperationFlags): Promise<void> {
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

    return this.handleGeneratorError('Operation', operationName, async () => {
      const { targetDirectory: operationsDir, importDirectory } =
        this.ensureTargetDirectory(featurePath, operationType);
      const importPath = path.join(importDirectory, operationName);

      this.generateOperationFile(operationsDir, operationName, operationCode, flags);
      this.updateConfigFile(
        featurePath,
        operationName,
        operation,
        entities,
        importPath,
        flags
      );
    });
  }

  private generateOperationFile(
    operationsDir: string,
    operationName: string,
    operationCode: string,
    flags: OperationFlags
  ): void {
    const operationFile = `${operationsDir}/${operationName}.ts`;
    const fileExists = this.checkFileExists(
      operationFile,
      flags.force || false,
      'Operation file'
    );

    this.writeFile(operationFile, operationCode, 'operation file', fileExists);
  }

  private updateConfigFile(
    featurePath: string,
    operationName: string,
    operation: string,
    entities: string[],
    importPath: string,
    flags: OperationFlags
  ): void {
    const configPath = this.validateFeatureConfig(featurePath);
    const isAction = ['create', 'update', 'delete'].includes(operation);
    const methodName = isAction ? 'addAction' : 'addQuery';
    const configExists = this.checkConfigExists(
      configPath,
      methodName,
      operationName,
      flags.force || false
    );

    if (!configExists || flags.force) {
      const definition = this.getDefinition(
        operationName,
        featurePath,
        entities,
        isAction ? 'action' : 'query',
        importPath,
        flags.auth
      );

      this.updateFeatureConfig(
        featurePath,
        definition,
        configPath,
        configExists,
        operation
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
      case OPERATIONS.GETFILTERED:
        return `getFiltered${getPlural(modelName)}`;
      default:
        return `${operation}${modelName}`;
    }
  }

  /**
   * Gets the TypeScript type name for an operation.
   */
  getOperationTypeName(
    operation: ActionOperation | QueryOperation,
    modelName: string
  ): string {
    return toPascalCase(this.getOperationName(operation, modelName));
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

    if (operation !== OPERATIONS.GETALL) {
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
    return operation === OPERATIONS.GETALL ||
      operation === OPERATIONS.GET ||
      operation === OPERATIONS.GETFILTERED
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
    const templatePath = `files/server/${getPlural(operationType)}/${operation}.eta`;
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

    switch (operation) {
      case 'create':
        typeParams = `<Omit<${model.name}, ${omitFields}>>`;

        break;
      case 'update':
        typeParams = `<Pick<${model.name}, "${idField.name}"> & Partial<Omit<${model.name}, ${omitFields}>>>`;

        break;
      case 'delete':
        typeParams = `<Pick<${model.name}, "${idField.name}">>`;

        break;
      case 'get':
        typeParams = `<Pick<${model.name}, "${idField.name}">>`;

        break;
      case 'getAll':
        typeParams = `<void>`;

        break;
      case 'getFiltered':
        typeParams = `<Partial<Omit<${model.name}, ${omitFields}>>>`;

        break;
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

    return this.templateUtility.processTemplate(templatePath, replacements);
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
    operationType: OperationType,
    importPath: string,
    auth = false
  ): string {
    if (!OPERATION_TYPES.includes(operationType)) {
      handleFatalError(`Unknown operation type: ${operationType}`);
    }
    const directory = TYPE_DIRECTORIES[operationType];
    const featureDir = getFeatureImportPath(featurePath);
    const templatePath = 'config/operation.eta';

    return this.templateUtility.processTemplate(templatePath, {
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
