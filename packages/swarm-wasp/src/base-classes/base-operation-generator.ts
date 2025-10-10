import {
  capitalise,
  getPlural,
  handleFatalError,
  toPascalCase,
} from '@ingenyus/swarm-core';
import { OperationConfigEntry } from '../interfaces/generator-args';
import { EntityMetadata } from '../interfaces/prisma';
import {
  ActionOperation,
  CONFIG_TYPES,
  OPERATION_TYPES,
  OPERATIONS,
  OperationType,
  QueryOperation,
  TYPE_DIRECTORIES,
} from '../types/constants';
import { copyDirectory, getFeatureImportPath } from '../utils/filesystem';
import {
  generateJsonTypeHandling,
  getEntityMetadata,
  getIdField,
  getJsonFields,
  getOmitFields,
  needsPrismaImport,
} from '../utils/prisma';
import { BaseEntityGenerator } from './base-entity-generator';

/**
 * Abstract base class for generators that need to generate operation files.
 * Provides shared logic for operation file generation that can be used by
 * both OperationGenerator and CrudGenerator.
 */
export abstract class BaseOperationGenerator<
  TArgs extends
    | typeof CONFIG_TYPES.ACTION
    | typeof CONFIG_TYPES.QUERY
    | typeof CONFIG_TYPES.CRUD,
> extends BaseEntityGenerator<TArgs> {
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
   * Gets the template path for operation templates.
   * This method resolves operation templates to the operation generator's directory
   * instead of the current generator's directory.
   */
  protected getOperationTemplatePath(templateName: string): string {
    // Resolve operation templates relative to the operation generator
    return this.resolveTemplatePath(templateName, 'operation', import.meta.url);
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
    operation: ActionOperation | QueryOperation
  ): string {
    const imports: string[] = [];

    if (operation !== OPERATIONS.GETALL) {
      if (needsPrismaImport(model)) {
        imports.push('import { Prisma } from "@prisma/client";');
      }

      imports.push(`import { ${modelName} } from "wasp/entities";`);
    }

    imports.push('import { HttpError } from "wasp/server";');
    imports.push(
      `import type { ${this.getOperationTypeName(
        operation,
        modelName
      )} } from "wasp/server/operations";`
    );

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
    entities = [modelName],
    isCrudOverride = false,
    crudName: string | null = null
  ): Promise<{
    operationCode: string;
    configEntry: OperationConfigEntry;
    operationType: string;
    operationName: string;
  }> {
    const model = await getEntityMetadata(modelName);
    const operationType = this.getOperationType(operation);
    const operationName = this.getOperationName(operation, modelName);
    const operationCode = this.generateOperationCode(
      model,
      operation,
      auth,
      isCrudOverride,
      crudName
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

  /**
   * Generates the code for an operation.
   */
  generateOperationCode(
    model: EntityMetadata,
    operation: ActionOperation | QueryOperation,
    auth = false,
    isCrudOverride = false,
    crudName: string | null = null
  ): string {
    const operationType = this.getOperationType(operation);
    const templatePath = this.getOperationTemplatePath(`${operation}.eta`);
    const idField = getIdField(model);
    const omitFields = getOmitFields(model);
    const jsonFields = getJsonFields(model);
    const pluralModelName = getPlural(model.name);
    const pluralModelNameLower = pluralModelName.toLowerCase();
    const modelNameLower = model.name.toLowerCase();
    const operationName = this.getOperationName(operation, model.name);
    const imports = isCrudOverride
      ? ''
      : this.generateImports(model, model.name, operation);
    const jsonTypeHandling = generateJsonTypeHandling(jsonFields);
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
   * Generates an operation file for a given operation.
   */
  protected generateOperationFile(
    operationsDir: string,
    operationName: string,
    operationCode: string,
    force = false
  ): void {
    const operationFile = `${operationsDir}/${operationName}.ts`;
    const fileExists = this.checkFileExists(
      operationFile,
      force,
      'Operation file'
    );

    this.writeFile(operationFile, operationCode, 'operation file', fileExists);
  }

  /**
   * Copies a directory of operation templates to the target feature directory.
   * @param templateDir - The source template directory
   * @param targetDir - The target feature directory
   */
  public copyOperationTemplates(templateDir: string, targetDir: string): void {
    copyDirectory(this.fileSystem, templateDir, targetDir);
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
    // Config templates are in the config generator's templates directory
    const configGeneratorDir = this.path.dirname(
      new URL(import.meta.url).pathname
    );
    const configTemplatesDir = this.path.join(
      configGeneratorDir,
      '..',
      'generators',
      'config',
      'templates'
    );
    const templatePath = this.path.join(configTemplatesDir, 'operation.eta');

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
