import { GeneratorServices, Out, toCamelCase } from '@ingenyus/swarm';
import path from 'node:path';
import { CONFIG_TYPES, ensureDirectoryExists } from '../../common';
import { ComponentGeneratorBase } from '../base';
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

  constructor(services: GeneratorServices) {
    super(services);
  }

  async generate(args: Out<typeof schema>): Promise<void> {
    const { name, path: namespacePath, feature } = args;
    const namespaceName = toCamelCase(name);

    return this.handleGeneratorError(
      this.componentType,
      namespaceName,
      async () => {
        const configPath = this.validateFeatureConfig(feature);
        const {
          targetDirectory: apiTargetDirectory,
          importDirectory: apiImportDirectory,
        } = this.ensureTargetDirectory(feature, 'api');
        const middlewareTargetDirectory = path.join(
          apiTargetDirectory,
          'middleware'
        );

        ensureDirectoryExists(this.fileSystem, middlewareTargetDirectory);

        const importDirectory = `${apiImportDirectory}/middleware`;
        const targetFile = `${middlewareTargetDirectory}/${namespaceName}.ts`;

        await this.generateMiddlewareFile(
          targetFile,
          namespaceName,
          args.force || false
        );
        await this.updateConfigFile(
          namespaceName,
          importDirectory,
          namespacePath,
          args,
          configPath
        );
      }
    );
  }

  private async updateConfigFile(
    namespaceName: string,
    importDirectory: string,
    namespacePath: string,
    args: Out<typeof schema>,
    configFilePath: string
  ) {
    const { force = false } = args;
    const importPath = `${importDirectory}/${namespaceName}`;
    const definition = await this.getDefinition(
      namespaceName,
      importPath,
      namespacePath
    );

    this.updateConfigWithCheck(
      configFilePath,
      'addApiNamespace',
      namespaceName,
      definition,
      args.feature,
      force
    );
  }

  /**
   * Generates an apiNamespace definition for the feature configuration.
   */
  async getDefinition(
    namespaceName: string,
    middlewareImportPath: string,
    pathValue: string
  ): Promise<string> {
    const templatePath = this.templateUtility.resolveTemplatePath(
      'config/api-namespace.eta',
      'api-namespace',
      import.meta.url
    );

    return this.templateUtility.processTemplate(templatePath, {
      namespaceName,
      middlewareImportPath,
      pathValue,
    });
  }
}
