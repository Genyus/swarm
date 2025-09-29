import path from 'node:path';
import { ApiNamespaceFlags } from '../types';
import { hasApiNamespaceDefinition, toCamelCase } from '../utils/strings';
import { ApiBaseGenerator } from './api-base';

export class ApiNamespaceGenerator extends ApiBaseGenerator<ApiNamespaceFlags> {
  async generate(featurePath: string, flags: ApiNamespaceFlags): Promise<void> {
    const { name, path: apiPath } = flags;

    if (!name || !apiPath) {
      this.logger.error(
        'Both --name and --path are required for apiNamespace generation'
      );
      return;
    }

    const namespaceName = toCamelCase(name);
    const { targetDirectory, importDirectory } = this.ensureTargetDirectory(
      featurePath,
      'middleware'
    );

    return this.handleGeneratorError(
      'apiNamespace',
      namespaceName,
      async () => {
        const targetFile = `${targetDirectory}/${namespaceName}.ts`;

        this.generateMiddlewareFile(
          targetFile,
          namespaceName,
          'apiNamespace',
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
