import { GeneratorServices, Out } from '@ingenyus/swarm';
import { CONFIG_TYPES } from '../../common';
import { OperationGeneratorBase } from '../base';
import { schema } from './schema';

export class ActionGenerator extends OperationGeneratorBase<
  typeof schema,
  typeof CONFIG_TYPES.ACTION
> {
  protected get componentType() {
    return CONFIG_TYPES.ACTION;
  }

  description = 'Generates a Wasp Action';
  schema = schema;

  constructor(services: GeneratorServices) {
    super(services);
  }

  async generate(args: Out<typeof schema>): Promise<void> {
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
