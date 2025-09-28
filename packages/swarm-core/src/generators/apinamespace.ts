import path from 'node:path';
import { ApiNamespaceFlags } from '../types';
import { hasApiNamespaceDefinition, toCamelCase } from '../utils/strings';
import { BaseGenerator } from './base';

export class ApiNamespaceGenerator extends BaseGenerator<ApiNamespaceFlags> {
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

        this.generateMiddlewareFile(targetFile, namespaceName, flags);
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

  private generateMiddlewareFile(
    targetFile: string,
    namespaceName: string,
    flags: ApiNamespaceFlags
  ) {
    this.renderTemplateToFile(
      'files/server/middleware/middleware.eta',
      {
        name: namespaceName,
        namespaceName,
        middlewareFnName: namespaceName,
      },
      targetFile,
      'middleware file',
      flags.force || false
    );
  }

  private updateConfigFile(
    featurePath: string,
    namespaceName: string,
    importDirectory: string,
    apiPath: string,
    flags: ApiNamespaceFlags
  ) {
    const configFilePrefix = featurePath.split('/').join('.');
    const configDir = this.fs.existsSync(featurePath)
      ? featurePath
      : featurePath.split('/')[0];
    const configFilePath = path.join(configDir, `${configFilePrefix}.wasp.ts`);

    if (!this.fs.existsSync(configFilePath)) {
      this.logger.error(`Feature config file not found: ${configFilePath}`);
      return;
    }

    const configContent = this.fs.readFileSync(configFilePath, 'utf8');
    const configExists = hasApiNamespaceDefinition(
      configContent,
      namespaceName
    );

    if (configExists && !flags.force) {
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
