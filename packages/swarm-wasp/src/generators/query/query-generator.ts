import { GeneratorServices, Out } from '@ingenyus/swarm';
import { CONFIG_TYPES } from '../../common';
import { OperationGeneratorBase } from '../base';
import { schema } from './schema';

export class QueryGenerator extends OperationGeneratorBase<
  typeof schema,
  typeof CONFIG_TYPES.QUERY
> {
  protected get componentType() {
    return CONFIG_TYPES.QUERY;
  }

  description = 'Generates a Wasp Query';
  schema = schema;

  constructor(services: GeneratorServices) {
    super(services);
  }

  async generate(args: Out<typeof schema>): Promise<void> {
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
      this.componentType,
      operationName,
      async () => {
        this.ensureWaspCompatible();

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
