import { getPlural, toCamelCase, toPascalCase } from '@ingenyus/swarm-core';
import { BaseOperationGenerator } from '../../base-classes/base-operation-generator';
import { CrudFlags } from '../../interfaces/generator-args';
import { CONFIG_TYPES, CrudOperation } from '../../types/constants';
import { schema } from './schema';

const CRUD_OPERATIONS_LIST: readonly CrudOperation[] = [
  'get',
  'getAll',
  'create',
  'update',
  'delete',
] as const;

export class CrudGenerator extends BaseOperationGenerator<
  typeof CONFIG_TYPES.CRUD
> {
  protected get entityType() {
    return CONFIG_TYPES.CRUD;
  }

  description = 'Generate CRUD operations for Wasp applications';
  schema = schema;

  async generate(params: {
    featurePath: string;
    flags: CrudFlags;
  }): Promise<void> {
    const { featurePath, flags } = params;
    const { dataType } = flags;
    const crudName = toCamelCase(getPlural(dataType));

    return this.handleGeneratorError(this.entityType, crudName, async () => {
      if (flags.override && flags.override.length > 0) {
        const { targetDirectory } = this.ensureTargetDirectory(
          featurePath,
          this.entityType.toLowerCase()
        );
        const targetFile = `${targetDirectory}/${crudName}.ts`;
        const operations = await this.getOperationsCode(
          dataType,
          crudName,
          flags
        );
        this.generateCrudFile(
          targetFile,
          crudName,
          dataType,
          operations,
          flags.force || false
        );
      }

      this.updateConfigFile(featurePath, crudName, dataType, flags);
    });
  }

  private generateCrudFile(
    targetFile: string,
    crudName: string,
    dataType: string,
    operations: string,
    force: boolean
  ) {
    const imports = `import { type ${toPascalCase(dataType)} } from "wasp/entities";
import { HttpError } from "wasp/server";
import { type ${toPascalCase(crudName)} } from "wasp/server/crud";`;

    const replacements = {
      imports,
      operations,
    };

    this.renderTemplateToFile(
      'crud.eta',
      replacements,
      targetFile,
      'CRUD file',
      force
    );
  }

  private updateConfigFile(
    featurePath: string,
    crudName: string,
    dataType: string,
    flags: CrudFlags
  ) {
    const configPath = this.validateFeatureConfig(featurePath);
    const configExists = this.checkConfigExists(
      configPath,
      'addCrud',
      crudName,
      flags.force || false
    );

    const operations = this.buildOperations(flags);
    const definition = this.getDefinition(crudName, dataType, operations);
    this.updateFeatureConfig(
      featurePath,
      definition,
      configPath,
      configExists,
      'CRUD'
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
    const templatePath = this.getTemplatePath('config/crud.eta');
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
