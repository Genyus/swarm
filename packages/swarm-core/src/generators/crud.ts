import { CrudFlags, CrudOperation } from '../types';
import { getPlural, toCamelCase } from '../utils/strings';
import { BaseGenerator } from './base';

const CRUD_OPERATIONS: readonly CrudOperation[] = [
  'get',
  'getAll',
  'create',
  'update',
  'delete',
] as const;

export class CrudGenerator extends BaseGenerator<CrudFlags> {
  protected entityType = 'Crud';

  async generate(featurePath: string, flags: CrudFlags): Promise<void> {
    const { dataType } = flags;
    const crudName = toCamelCase(getPlural(dataType));
    const { targetDirectory } = this.ensureTargetDirectory(
      featurePath,
      this.entityType.toLowerCase()
    );

    return this.handleGeneratorError(
      this.entityType.toUpperCase(),
      crudName,
      async () => {
        if (flags.override && flags.override.length > 0) {
          const targetFile = `${targetDirectory}/${crudName}.ts`;

          this.generateCrudFile(targetFile, crudName, dataType, flags);
        }

        this.updateConfigFile(featurePath, crudName, dataType, flags);
      }
    );
  }

  private generateCrudFile(
    targetFile: string,
    crudName: string,
    dataType: string,
    flags: CrudFlags
  ) {
    const operations = this.buildOperations(flags);
    const replacements = {
      crudName,
      dataType,
      operations: JSON.stringify(operations, null, 2),
    };

    this.renderTemplateToFile(
      'files/server/crud.eta',
      replacements,
      targetFile,
      'CRUD file',
      flags.force || false
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
      dataType,
    } = flags;

    return CRUD_OPERATIONS.reduce(
      (acc, operation) => {
        if (excludeOps.includes(operation)) {
          return acc;
        }

        const operationConfig: Record<string, unknown> = {};

        if (publicOps.includes(operation)) {
          operationConfig.isPublic = true;
        }

        if (overrideOps.includes(operation)) {
          const operationDataType =
            operation === 'getAll' ? getPlural(dataType) : dataType;

          operationConfig.overrideFn = `import { ${operation}${operationDataType} } from '@src/operations/${operation}.js'`;
        }

        acc[operation] = operationConfig;

        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  /**
   * Generates a CRUD definition for the feature configuration.
   */
  getDefinition(crudName: string, dataType: string, operations: any): string {
    const templatePath = 'config/crud.eta';
    const operationsStr = JSON.stringify(operations, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .split('\n')
      .map((line, index) => (index === 0 ? line : '        ' + line))
      .join('\n');

    return this.templateUtility.processTemplate(templatePath, {
      crudName,
      dataType,
      operations: operationsStr,
    });
  }
}
