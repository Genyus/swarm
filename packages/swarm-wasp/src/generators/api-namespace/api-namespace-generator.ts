import path from 'node:path';
import { type Out, toCamelCase } from '@ingenyus/swarm';
import { CONFIG_TYPES, ensureDirectoryExists } from '../../common';
import { ComponentGeneratorBase } from '../base';
import type { SpecDeclaration } from '../config';
import { schema } from './schema';

export class ApiNamespaceGenerator extends ComponentGeneratorBase<
  typeof schema,
  typeof CONFIG_TYPES.API_NAMESPACE
> {
  protected get componentType() {
    return CONFIG_TYPES.API_NAMESPACE;
  }

  description = 'Generates a Wasp API Namespace';
  schema = schema;

  async generate(args: Out<typeof schema>): Promise<void> {
    const { name, path: namespacePath, feature } = args;
    const namespaceName = toCamelCase(name);

    return this.handleGeneratorError(
      this.componentType,
      namespaceName,
      async () => {
        this.ensureWaspCompatible();

        const configPath = this.validateFeatureConfig(feature);
        const { targetDirectory: apiTargetDirectory } =
          this.ensureTargetDirectory(feature, 'api');
        const middlewareTargetDirectory = path.join(
          apiTargetDirectory,
          'middleware'
        );

        ensureDirectoryExists(this.fileSystem, middlewareTargetDirectory);

        const targetFile = `${middlewareTargetDirectory}/${namespaceName}.ts`;

        await this.generateMiddlewareFile(
          targetFile,
          namespaceName,
          args.force || false
        );
        this.updateConfigFile(namespaceName, namespacePath, args, configPath);
      }
    );
  }

  private updateConfigFile(
    namespaceName: string,
    namespacePath: string,
    args: Out<typeof schema>,
    configFilePath: string
  ) {
    const definition = this.getDefinition(namespaceName, namespacePath);

    this.updateConfigWithCheck(
      configFilePath,
      definition,
      args.feature,
      args.force || false
    );
  }

  /**
   * Builds a native apiNamespace spec declaration for the feature configuration.
   */
  getDefinition(namespaceName: string, pathValue: string): SpecDeclaration {
    const from = this.getRelativeRefPath('api', `middleware/${namespaceName}`);

    return {
      kind: 'apiNamespace',
      call: `apiNamespace("${pathValue}", { middlewareConfigFn: ${namespaceName} })`,
      refImports: [{ names: [namespaceName], from }],
    };
  }
}
