import path from 'node:path';
import {
  ActionOperation,
  OPERATIONS,
  OperationConfigEntry,
  OperationFlags,
  QueryOperation,
} from '../types';
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
} from '../utils/filesystem';
import { getEntityMetadata, needsPrismaImport } from '../utils/prisma';
import { getPlural } from '../utils/strings';
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
      const configPath = `${getConfigDir(this.fs)}/${
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
        });
        this.logger.success(
          `${
            configExists ? 'Updated' : 'Added'
          } ${operationType} config in: ${configPath}`
        );
      }
      this.logger.info(`\nOperation ${operationName} processing complete.`);
    } catch (error: any) {
      this.logger.error('Failed to generate operation: ' + error.stack);
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
    const templatePath =
      this.templateUtility.getFileTemplatePath(operationType);
    const template = this.fs.readFileSync(templatePath, 'utf8');

    const replacements = {
      OPERATION_NAME: this.getOperationName(operation, model.name),
      MODEL_NAME: model.name,
      AUTH_REQUIRED: auth.toString(),
      IMPORTS: this.generateImports(model, model.name, operation),
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
}
