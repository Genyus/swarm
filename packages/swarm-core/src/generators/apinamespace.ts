import path from 'node:path';
import { ApiNamespaceFlags } from '../types';
import { toCamelCase } from '../utils/strings';
import { ApiBaseGenerator } from './api-base';

export class ApiNamespaceGenerator extends ApiBaseGenerator<ApiNamespaceFlags> {
  protected entityType = 'ApiNamespace';

  async generate(featurePath: string, flags: ApiNamespaceFlags): Promise<void> {
    const { name, path: apiPath } = flags;
    const namespaceName = toCamelCase(name);

    return this.handleGeneratorError(
      this.entityType,
      namespaceName,
      async () => {
        const { targetDirectory, importDirectory } = this.ensureTargetDirectory(
          featurePath,
          'middleware'
        );
        const targetFile = `${targetDirectory}/${namespaceName}.ts`;

        this.generateMiddlewareFile(
          targetFile,
          namespaceName,
          flags.force || false
        );
        this.updateConfigFile(
          featurePath,
          namespaceName,
          importDirectory,
          apiPath,
          flags
        );
      }
    );
  }

  private updateConfigFile(
    featurePath: string,
    namespaceName: string,
    importDirectory: string,
    apiPath: string,
    flags: ApiNamespaceFlags
  ) {
    const configFilePath = this.validateFeatureConfig(featurePath);
    const { force = false } = flags;
    const configExists = this.checkConfigExists(
      configFilePath,
      'addApiNamespace',
      namespaceName,
      force
    );

    if (configExists && !force) {
      this.logger.info(
        `apiNamespace config already exists in ${configFilePath}`
      );
      this.logger.info('Use --force to overwrite');
    } else {
      const importPath = path.join(importDirectory, namespaceName);
      const definition = this.getDefinition(namespaceName, importPath, apiPath);

      this.updateFeatureConfig(
        featurePath,
        definition,
        configFilePath,
        configExists,
        'apiNamespace'
      );
    }
  }

  /**
   * Generates an apiNamespace definition for the feature configuration.
   */
  getDefinition(
    namespaceName: string,
    middlewareImportPath: string,
    pathValue: string
  ): string {
    const templatePath = 'config/apiNamespace.eta';

    return this.templateUtility.processTemplate(templatePath, {
      namespaceName,
      middlewareImportPath,
      pathValue,
    });
  }
}
