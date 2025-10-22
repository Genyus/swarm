import { getPlural, toCamelCase, toPascalCase } from '@ingenyus/swarm';
import { getEntityMetadata, needsPrismaImport } from '../../common';
import { CrudFlags } from '../../generators/args.types';
import {
  ActionOperation,
  CONFIG_TYPES,
  CrudOperation,
  EntityMetadata,
  OPERATIONS,
  QueryOperation,
} from '../../types';
import { OperationGeneratorBase } from '../base';
import { schema } from './schema';

const CRUD_OPERATIONS_LIST: readonly CrudOperation[] = [
  'get',
  'getAll',
  'create',
  'update',
  'delete',
] as const;

export class CrudGenerator extends OperationGeneratorBase<
  typeof CONFIG_TYPES.CRUD
> {
  protected get entityType() {
    return CONFIG_TYPES.CRUD;
  }

  description = 'Generate CRUD operations for Wasp applications';
  schema = schema;

  async generate(flags: CrudFlags): Promise<void> {
    const { dataType, feature } = flags;
    const crudName = toCamelCase(getPlural(dataType));
    const crudType = toPascalCase(crudName);

    return this.handleGeneratorError(this.entityType, crudName, async () => {
      const configPath = this.validateFeatureConfig(feature);
      const { targetDirectory } = this.ensureTargetDirectory(
        feature,
        this.entityType.toLowerCase()
      );

      if ((flags.override?.length ?? 0) > 0) {
        const targetFile = `${targetDirectory}/${crudName}.ts`;
        const operations = await this.getOperationsCode(
          dataType,
          crudName,
          flags
        );

        await this.generateCrudFile(
          targetFile,
          dataType,
          operations,
          crudType,
          flags
        );
      }

      await this.updateConfigFile(
        feature,
        crudName,
        dataType,
        flags,
        configPath
      );
    });
  }

  private async generateCrudFile(
    targetFile: string,
    dataType: string,
    operations: string,
    crudName: string,
    flags: CrudFlags
  ) {
    const { override = [], force = false } = flags;
    const model = await getEntityMetadata(dataType);
    const imports = this.generateCrudImports(
      model,
      dataType,
      crudName,
      override
    );

    const replacements = {
      imports,
      operations,
    };

    await this.renderTemplateToFile(
      'crud.eta',
      replacements,
      targetFile,
      'CRUD file',
      force
    );
  }

  /**
   * Generates import statements for an operation.
   */
  private generateCrudImports(
    model: EntityMetadata,
    modelName: string,
    crudName: string,
    operations: CrudOperation[]
  ): string {
    const imports: string[] = [];

    if (operations.some((operation) => operation !== 'getAll')) {
      if (needsPrismaImport(model)) {
        imports.push('import { Prisma } from "@prisma/client";');
      }

      imports.push(`import { type ${modelName} } from "wasp/entities";`);
    }

    imports.push('import { HttpError } from "wasp/server";');
    imports.push(`import { type ${crudName} } from "wasp/server/crud";`);

    return imports.join('\n');
  }

  private async updateConfigFile(
    feature: string,
    crudName: string,
    dataType: string,
    flags: CrudFlags,
    configPath: string
  ) {
    const operations = this.buildOperations(flags);
    const definition = this.getDefinition(crudName, dataType, operations);

    this.updateConfigWithCheck(
      configPath,
      'addCrud',
      crudName,
      definition,
      feature,
      flags.force || false
    );
  }

  private buildOperations(flags: CrudFlags): Record<string, unknown> {
    const {
      public: publicOps = [],
      override: overrideOps = [],
      exclude: excludeOps = [],
    } = flags;

    return CRUD_OPERATIONS_LIST.reduce(
      (acc, operation) => {
        if (excludeOps.includes(operation)) {
          return acc;
        }

        const operationConfig: Record<string, unknown> = {};

        if (publicOps.includes(operation)) {
          operationConfig.isPublic = true;
        }

        if (overrideOps.includes(operation)) {
          operationConfig.override = true;
        }

        acc[operation] = operationConfig;

        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  /**
   * Generates operation code for overridden CRUD operations and returns as a single string.
   */
  private async getOperationsCode(
    dataType: string,
    crudName: string,
    flags: CrudFlags
  ): Promise<string> {
    if (!flags.override || flags.override.length === 0) {
      return '';
    }

    const operationCodes: string[] = [];

    for (const operation of flags.override) {
      const { operationCode } = await this.generateOperationComponents(
        dataType,
        operation,
        flags.auth || false,
        [dataType],
        true,
        toPascalCase(crudName)
      );
      operationCodes.push(operationCode.replace(/^[\r\n]/, ''));
    }

    return operationCodes.join('');
  }

  /**
   * Generates a CRUD definition for the feature configuration.
   */
  getDefinition(crudName: string, dataType: string, operations: any): string {
    const templatePath = this.templateUtility.resolveTemplatePath(
      'config/crud.eta',
      'crud',
      import.meta.url
    );
    const operationsStr = JSON.stringify(operations, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .slice(1, -1) // Remove outer braces
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line, index) => (index === 0 ? line.trimStart() : '    ' + line))
      .join('\n');

    return this.templateUtility.processTemplate(templatePath, {
      crudName: toPascalCase(crudName),
      dataType,
      operations: operationsStr,
    });
  }
}
