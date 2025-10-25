import { CONFIG_TYPES } from '../../types';
import { OperationGeneratorBase } from '../base';
import { ActionArgs, schema } from './schema';

export class ActionGenerator extends OperationGeneratorBase<
  ActionArgs,
  typeof CONFIG_TYPES.ACTION
> {
  protected get entityType() {
    return CONFIG_TYPES.ACTION;
  }

  description = 'Generate actions (mutations) for Wasp applications';
  schema = schema;

  async generate(args: ActionArgs): Promise<void> {
    const { dataType, feature, name } = args;
    const operation = args.operation;
    const operationType = 'action';
    const entities = args.entities ?? [];

    if (dataType && !entities.includes(dataType)) {
      entities.unshift(dataType);
    }

    const { operationCode, operationName } =
      await this.generateOperationComponents(
        dataType,
        operation,
        args.auth,
        entities,
        false,
        null,
        name
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
          args.force || false
        );

        // Generate config definition and update
        const definition = this.getDefinition(
          operationName,
          feature,
          entities,
          'action',
          importPath,
          args.auth
        );

        this.updateConfigWithCheck(
          configPath,
          'addAction',
          operationName,
          definition,
          feature,
          args.force || false
        );
      }
    );
  }
}
