import {
  GeneratorServices,
  getPlural,
  Out,
  toCamelCase,
  toPascalCase,
} from '@ingenyus/swarm';
import {
  CONFIG_TYPES,
  CrudOperation,
  EntityMetadata,
  getEntityMetadata,
  needsPrismaImport,
} from '../../common';
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
  typeof schema,
  typeof CONFIG_TYPES.CRUD
> {
  protected get componentType() {
    return CONFIG_TYPES.CRUD;
  }

  description = 'Generates a Wasp CRUD operation';
  schema = schema;

  constructor(services: GeneratorServices) {
    super(services);
  }

  async generate(args: Out<typeof schema>): Promise<void> {
    const { dataType, feature, name } = args;
    const crudName = name || toCamelCase(getPlural(dataType));
    const crudType = toPascalCase(crudName);

    return this.handleGeneratorError(this.componentType, crudName, async () => {
      this.ensureWaspCompatible();

      const configPath = this.validateFeatureConfig(feature);
      const { targetDirectory } = this.ensureTargetDirectory(
        feature,
        this.componentType.toLowerCase()
      );

      if ((args.override?.length ?? 0) > 0) {
        const targetFile = `${targetDirectory}/${crudName}.ts`;
        const operations = await this.getOperationsCode(
          dataType,
          crudName,
          args
        );

        await this.generateCrudFile(
          targetFile,
          dataType,
          operations,
          crudType,
          args
        );
      }

      await this.updateConfigFile(
        feature,
        crudName,
        dataType,
        args,
        configPath
      );
    });
  }

  private async generateCrudFile(
    targetFile: string,
    dataType: string,
    operations: string,
    crudName: string,
    args: Out<typeof schema>
  ) {
    const { override = [], force = false } = args;
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
    args: Out<typeof schema>,
    configPath: string
  ) {
    const operations = this.buildOperations(args);
    const definition = this.getDefinition(crudName, dataType, operations);

    this.updateConfigWithCheck(
      configPath,
      'addCrud',
      crudName,
      definition,
      feature,
      args.force || false
    );
  }

  private buildOperations(args: Out<typeof schema>): Record<string, unknown> {
    const {
      public: publicOps = [],
      override: overrideOps = [],
      exclude: excludeOps = [],
    } = args;

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
    args: Out<typeof schema>
  ): Promise<string> {
    const { override = [], public: publicOps = [] } = args;

    if (override.length === 0) {
      return '';
    }

    const operationCodes: string[] = [];

    for (const operation of override) {
      const { operationCode } = await this.generateOperationComponents(
        dataType,
        operation,
        !publicOps.includes(operation),
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
      crudName,
      dataType,
      operations: operationsStr,
    });
  }
}
