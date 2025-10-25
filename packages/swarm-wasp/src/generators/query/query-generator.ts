import { CONFIG_TYPES } from '../../types';
import { OperationGeneratorBase } from '../base';
import { QueryArgs, schema } from './schema';

export class QueryGenerator extends OperationGeneratorBase<
  QueryArgs,
  typeof CONFIG_TYPES.QUERY
> {
  protected get entityType() {
    return CONFIG_TYPES.QUERY;
  }

  description = 'Generate queries (data fetching) for Wasp applications';
  schema = schema;

  async generate(args: QueryArgs): Promise<void> {
    const { dataType, feature, name } = args;
    const operation = args.operation;
    const operationType = 'query';
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
          'query',
          importPath,
          args.auth
        );

        this.updateConfigWithCheck(
          configPath,
          'addQuery',
          operationName,
          definition,
          feature,
          args.force || false
        );
      }
    );
  }
}
