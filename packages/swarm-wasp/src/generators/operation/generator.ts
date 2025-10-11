import { OperationGeneratorBase } from '../../base-classes/base-operation-generator';
import { OperationFlags } from '../../interfaces/generator-args';
import { CONFIG_TYPES } from '../../types/constants';
import { schema } from './schema';

export class OperationGenerator extends OperationGeneratorBase<
  typeof CONFIG_TYPES.ACTION | typeof CONFIG_TYPES.QUERY
> {
  protected get entityType() {
    return CONFIG_TYPES.ACTION;
  }

  description =
    'Generate operations (queries and actions) for Wasp applications';
  schema = schema;

  async generate(flags: OperationFlags): Promise<void> {
    const { dataType, feature } = flags;
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

    return this.handleGeneratorError(
      this.entityType,
      operationName,
      async () => {
        const configPath = this.validateFeatureConfig(feature);
        const { targetDirectory: operationsDir, importDirectory } =
          this.ensureTargetDirectory(feature, operationType);
        const importPath = `${importDirectory}/${operationName}`;

        this.generateOperationFile(
          operationsDir,
          operationName,
          operationCode,
          flags.force || false
        );
        this.updateConfigFile(
          feature,
          operationName,
          operation,
          entities,
          importPath,
          flags,
          configPath
        );
      }
    );
  }

  private updateConfigFile(
    feature: string,
    operationName: string,
    operation: string,
    entities: string[],
    importPath: string,
    flags: OperationFlags,
    configPath: string
  ): void {
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
        feature,
        entities,
        isAction ? 'action' : 'query',
        importPath,
        flags.auth
      );

      this.updateFeatureConfig(
        feature,
        definition,
        configPath,
        configExists,
        operation
      );
    }
  }
}
