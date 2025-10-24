import { toCamelCase } from '@ingenyus/swarm';
import path from 'node:path';
import { CONFIG_TYPES } from '../../types';
import { EntityGeneratorBase } from '../base';
import { ApiNamespaceArgs, schema } from './schema';

export class ApiNamespaceGenerator extends EntityGeneratorBase<
  ApiNamespaceArgs,
  typeof CONFIG_TYPES.API_NAMESPACE
> {
  protected get entityType() {
    return CONFIG_TYPES.API_NAMESPACE;
  }

  description = 'Generate API namespaces for Wasp applications';
  schema = schema;

  async generate(args: ApiNamespaceArgs): Promise<void> {
    const { name, path: namespacePath, feature } = args;
    const namespaceName = toCamelCase(name);

    return this.handleGeneratorError(
      this.entityType,
      namespaceName,
      async () => {
        const configPath = this.validateFeatureConfig(feature);
        const { targetDirectory, importDirectory } = this.ensureTargetDirectory(
          feature,
          'middleware'
        );
        const targetFile = `${targetDirectory}/${namespaceName}.ts`;

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
    args: ApiNamespaceArgs,
    configFilePath: string
  ) {
    const { force = false } = args;
    const importPath = path.join(importDirectory, namespaceName);
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
