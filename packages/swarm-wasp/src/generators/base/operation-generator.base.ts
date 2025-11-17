import {
  capitalise,
  getPlural,
  handleFatalError,
  StandardSchemaV1,
  toPascalCase,
} from '@ingenyus/swarm';
import {
  ActionOperation,
  CONFIG_TYPES,
  copyDirectory,
  EntityMetadata,
  generateIntersectionType,
  generateJsonTypeHandling,
  generateOmitType,
  generatePartialType,
  generatePickType,
  getEntityMetadata,
  getFeatureImportPath,
  getIdFields,
  getJsonFields,
  getOptionalFields,
  getRequiredFields,
  needsPrismaImport,
  OPERATION_TYPES,
  OPERATIONS,
  OperationType,
  QueryOperation,
  TYPE_DIRECTORIES,
} from '../../common';
import { ComponentGeneratorBase } from './component-generator.base';

/**
 * Represents a configuration entry for an operation.
 */
interface OperationConfigEntry {
  operationName: string;
  entities: string[];
  authRequired: boolean;
}

/**
 * Abstract base class for generators that need to generate operation files.
 * Provides shared logic for operation file generation that can be used by
 * both OperationGenerator and CrudGenerator.
 */
export abstract class OperationGeneratorBase<
  S extends StandardSchemaV1,
  TConfig extends
    | typeof CONFIG_TYPES.ACTION
    | typeof CONFIG_TYPES.QUERY
    | typeof CONFIG_TYPES.CRUD,
> extends ComponentGeneratorBase<S, TConfig> {
  /**
   * Gets the operation name based on operation type and model name.
   */
  getOperationName(
    operation: ActionOperation | QueryOperation,
    modelName: string,
    customName?: string
  ): string {
    if (customName) {
      return customName;
    }

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
   * This method resolves operation templates to the shared templates directory
   * instead of the current generator's directory.
   */
  protected getOperationTemplatePath(templateName: string): string {
    // Resolve operation templates relative to the shared templates directory
    return this.templateUtility.resolveTemplatePath(
      `operations/${templateName}`,
      'shared',
      import.meta.url
    );
  }

  /**
   * Gets the TypeScript type name for an operation.
   */
  getOperationTypeName(
    operation: ActionOperation | QueryOperation,
    modelName: string,
    customName?: string
  ): string {
    return toPascalCase(
      this.getOperationName(operation, modelName, customName)
    );
  }

  /**
   * Generates import statements for an operation.
   */
  generateImports(
    model: EntityMetadata,
    modelName: string,
    operation: ActionOperation | QueryOperation,
    customName?: string
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
        modelName,
        customName
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
    crudName: string | null = null,
    customName?: string
  ): Promise<{
    operationCode: string;
    configEntry: OperationConfigEntry;
    operationType: string;
    operationName: string;
  }> {
    const model = await getEntityMetadata(modelName);
    const operationType = this.getOperationType(operation);
    const operationName = this.getOperationName(
      operation,
      modelName,
      customName
    );
    const operationCode = await this.generateOperationCode(
      model,
      operation,
      auth,
      isCrudOverride,
      crudName,
      customName
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
  async generateOperationCode(
    model: EntityMetadata,
    operation: ActionOperation | QueryOperation,
    auth = false,
    isCrudOverride = false,
    crudName: string | null = null,
    customName?: string
  ): Promise<string> {
    const operationType = this.getOperationType(operation);
    const templatePath = this.getOperationTemplatePath(`${operation}.eta`);
    const allFieldNames = model.fields.map((f) => f.name);
    const idFields = getIdFields(model);
    const requiredFields = getRequiredFields(model);
    const optionalFields = getOptionalFields(model);
    const jsonFields = getJsonFields(model);
    const pluralModelName = getPlural(model.name);
    const pluralModelNameLower = pluralModelName.toLowerCase();
    const modelNameLower = model.name.toLowerCase();
    const operationName = this.getOperationName(
      operation,
      model.name,
      customName
    );
    const imports = isCrudOverride
      ? ''
      : this.generateImports(model, model.name, operation, customName);
    const jsonTypeHandling = generateJsonTypeHandling(jsonFields);
    let typeParams = '';

    switch (operation) {
      case 'create': {
        const pickRequired = generatePickType(
          model.name,
          requiredFields,
          allFieldNames
        );
        const partialOptional = generatePartialType(
          generatePickType(model.name, optionalFields, allFieldNames)
        );

        typeParams = `<${generateIntersectionType(pickRequired, partialOptional)}>`;

        break;
      }
      case 'update': {
        const pickId = generatePickType(model.name, idFields, allFieldNames);
        const omitId = generateOmitType(model.name, idFields, allFieldNames);
        const partialRest = generatePartialType(omitId);

        typeParams = `<${generateIntersectionType(pickId, partialRest)}>`;

        break;
      }
      case 'delete':
      case 'get':
        typeParams = `<${generatePickType(model.name, idFields, allFieldNames)}>`;

        break;
      case 'getAll':
        typeParams = `<void>`;

        break;
      case 'getFiltered':
        typeParams = `<${generatePartialType(model.name)}>`;

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
        typeAnnotation = `: ${this.getOperationTypeName(operation, model.name, customName)}${typeParams}`;
      } else {
        typeAnnotation = '';
      }
      if (operationType === 'query') {
        satisfiesType = `satisfies ${this.getOperationTypeName(operation, model.name, customName)}${typeParams}`;
      } else {
        satisfiesType = '';
      }
    }

    const isCompositeKey = idFields.length > 1;
    const compositeKeyName = isCompositeKey ? idFields.join('_') : '';
    const idFieldParams = isCompositeKey ? idFields.join(', ') : idFields[0];
    const whereClause = isCompositeKey
      ? `${compositeKeyName}: { ${idFields.map((f) => `${f}`).join(', ')} }`
      : idFields[0];

    const replacements = {
      operationName,
      modelName: model.name,
      authCheck,
      imports,
      idField: idFields[0],
      idFieldParams,
      whereClause,
      isCompositeKey: String(isCompositeKey),
      compositeKeyName,
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

    // Use templateUtility to resolve the config template path
    const templatePath = this.templateUtility.resolveTemplatePath(
      'operation.eta',
      'config',
      import.meta.url
    );

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
