import { toCamelCase } from '@ingenyus/swarm';
import path from 'node:path';
import { ApiNamespaceFlags } from '../../generators/args.types';
import { CONFIG_TYPES } from '../../types';
import { EntityGeneratorBase } from '../base';
import { schema } from './schema';

export class ApiNamespaceGenerator extends EntityGeneratorBase<
  typeof CONFIG_TYPES.API_NAMESPACE
> {
  protected get entityType() {
    return CONFIG_TYPES.API_NAMESPACE;
  }

  description = 'Generate API namespaces for Wasp applications';
  schema = schema;

  async generate(flags: ApiNamespaceFlags): Promise<void> {
    const { name, path: apiPath, feature } = flags;
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
          flags.force || false
        );
        await this.updateConfigFile(
          feature,
          namespaceName,
          importDirectory,
          apiPath,
          flags,
          configPath
        );
      }
    );
  }

  private async updateConfigFile(
    feature: string,
    namespaceName: string,
    importDirectory: string,
    apiPath: string,
    flags: ApiNamespaceFlags,
    configFilePath: string
  ) {
    const { force = false } = flags;
    const importPath = path.join(importDirectory, namespaceName);
    const definition = await this.getDefinition(
      namespaceName,
      importPath,
      apiPath
    );

    this.updateConfigWithCheck(
      configFilePath,
      'addApiNamespace',
      namespaceName,
      definition,
      feature,
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
