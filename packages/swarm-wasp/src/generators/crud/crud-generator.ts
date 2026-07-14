import {
  getPlural,
  type Out,
  toCamelCase,
  toPascalCase,
} from '@ingenyus/swarm';
import {
  CONFIG_TYPES,
  type CrudOperation,
  type EntityMetadata,
  getEntityMetadata,
  needsPrismaImport,
} from '../../common';
import { OperationGeneratorBase } from '../base';
import type { SpecDeclaration } from '../config';
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

  private updateConfigFile(
    feature: string,
    crudName: string,
    dataType: string,
    args: Out<typeof schema>,
    configPath: string
  ) {
    const definition = this.getDefinition(crudName, dataType, args);

    this.updateConfigWithCheck(
      configPath,
      definition,
      feature,
      args.force || false
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
   * Builds a native crud spec declaration for the feature configuration.
   * Enabled operations render as `{}`, public ones add `isPublic: true`, and
   * overridden ones add `overrideFn: <ref>` (all overrides import from the
   * single generated crud file).
   */
  getDefinition(
    crudName: string,
    dataType: string,
    args: Out<typeof schema>
  ): SpecDeclaration {
    const {
      public: publicOps = [],
      override: overrideOps = [],
      exclude: excludeOps = [],
    } = args;

    const overrideNames: string[] = [];
    const operationParts: string[] = [];

    for (const operation of CRUD_OPERATIONS_LIST) {
      if (excludeOps.includes(operation)) {
        continue;
      }

      const inner: string[] = [];

      if (publicOps.includes(operation)) {
        inner.push('isPublic: true');
      }

      if (overrideOps.includes(operation)) {
        const fn = this.getOperationName(operation, dataType);
        inner.push(`overrideFn: ${fn}`);
        overrideNames.push(fn);
      }

      operationParts.push(
        `${operation}: ${inner.length ? `{ ${inner.join(', ')} }` : '{}'}`
      );
    }

    // The crud declaration name must match the generated crud type namespace
    // (`wasp/server/crud`) that override operations are typed against, so it is
    // PascalCased; the override file itself is imported by its (camelCase) name.
    const crudType = toPascalCase(crudName);
    const call = `crud("${crudType}", "${dataType}", { ${operationParts.join(', ')} })`;
    const refImports = overrideNames.length
      ? [
          {
            names: overrideNames,
            from: this.getRelativeRefPath('crud', crudName),
          },
        ]
      : [];

    return { kind: 'crud', call, refImports };
  }
}
