import { OperationFlags } from '@ingenyus/swarm-core';
import { BaseOperationGenerator } from '../../base-classes/base-operation-generator';
import { CONFIG_TYPES } from '../../types/constants';
import { schema } from './schema';

export class OperationGenerator extends BaseOperationGenerator<
  typeof CONFIG_TYPES.ACTION | typeof CONFIG_TYPES.QUERY
> {
  protected get entityType() {
    return CONFIG_TYPES.ACTION;
  }

  description =
    'Generate operations (queries and actions) for Wasp applications';
  schema = schema;

  async generate(params: {
    featurePath: string;
    flags: OperationFlags;
  }): Promise<void> {
    const { featurePath, flags } = params;
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

    return this.handleGeneratorError(
      this.entityType,
      operationName,
      async () => {
        const { targetDirectory: operationsDir, importDirectory } =
          this.ensureTargetDirectory(featurePath, operationType);
        const importPath = `${importDirectory}/${operationName}`;

        this.generateOperationFile(
          operationsDir,
          operationName,
          operationCode,
          flags.force || false
        );
        this.updateConfigFile(
          featurePath,
          operationName,
          operation,
          entities,
          importPath,
          flags
        );
      }
    );
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
}
