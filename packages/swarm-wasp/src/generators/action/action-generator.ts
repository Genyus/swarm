import { ActionFlags } from '../../generators/args.types';
import { CONFIG_TYPES } from '../../types';
import { OperationGeneratorBase } from '../base';
import { schema } from './schema';

export class ActionGenerator extends OperationGeneratorBase<
  typeof CONFIG_TYPES.ACTION
> {
  protected get entityType() {
    return CONFIG_TYPES.ACTION;
  }

  description = 'Generate actions (mutations) for Wasp applications';
  schema = schema;

  async generate(flags: ActionFlags): Promise<void> {
    const { dataType, feature } = flags;
    const operation = flags.operation;
    const operationType = 'action';
    const entities = flags.entities
      ? Array.isArray(flags.entities)
        ? flags.entities
        : flags.entities
            .split(',')
            .map((e: string) => e.trim())
            .filter(Boolean)
      : [];

    if (dataType && !entities.includes(dataType)) {
      entities.unshift(dataType);
    }

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

        // Generate config definition and update
        const definition = this.getDefinition(
          operationName,
          feature,
          entities,
          'action',
          importPath,
          flags.auth
        );

        this.updateConfigWithCheck(
          configPath,
          'addAction',
          operationName,
          definition,
          feature,
          flags.force || false
        );
      }
    );
  }
}
