import path from 'node:path';
import { ApiNamespaceFlags } from '../types';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import {
  ensureDirectoryExists,
  getFeatureDir,
  getFeatureTargetDir,
} from '../utils/filesystem';
import { hasApiNamespaceDefinition, toCamelCase } from '../utils/strings';
import { TemplateUtility } from '../utils/templates';

export class ApiNamespaceGenerator implements NodeGenerator<ApiNamespaceFlags> {
  private templateUtility: TemplateUtility;

  constructor(
    public logger: Logger,
    public fs: IFileSystem,
    private featureGenerator: IFeatureGenerator
  ) {
    this.templateUtility = new TemplateUtility(fs);
    this.logger = logger;
    this.fs = fs;
    this.featureGenerator = featureGenerator;
  }

  async generate(featurePath: string, flags: ApiNamespaceFlags): Promise<void> {
    try {
      const { name, path: apiPath, force = false } = flags;

      if (!name || !apiPath) {
        this.logger.error(
          'Both --name and --path are required for apiNamespace generation'
        );
        return;
      }

      const namespaceName = toCamelCase(name);
      const { targetDirectory: middlewareDir, importDirectory } =
        getFeatureTargetDir(this.fs, featurePath, 'middleware');
      const importPath = path.join(importDirectory, namespaceName);
      ensureDirectoryExists(this.fs, middlewareDir);
      const middlewareFile = `${middlewareDir}/${namespaceName}.ts`;
      const fileExists = this.fs.existsSync(middlewareFile);

      if (fileExists && !force) {
        this.logger.info(`Middleware file already exists: ${middlewareFile}`);
        this.logger.info('Use --force to overwrite');
      } else {
        const templatePath = 'files/server/middleware/middleware.eta';
        const processed = this.templateUtility.processTemplate(templatePath, {
          name: namespaceName,
          namespaceName,
        });
        this.fs.writeFileSync(middlewareFile, processed);
        this.logger.success(
          `${fileExists ? 'Overwrote' : 'Generated'} middleware file: ${middlewareFile}`
        );
      }
      const configFilePrefix = featurePath.split('/').join('.');
      const configDir = getFeatureDir(this.fs, configFilePrefix);
      const configFilePath = path.join(
        configDir,
        `${configFilePrefix}.wasp.ts`
      );

      if (!this.fs.existsSync(configFilePath)) {
        this.logger.error(`Feature config file not found: ${configFilePath}`);
        return;
      }

      const configContent = this.fs.readFileSync(configFilePath, 'utf8');
      const configExists = hasApiNamespaceDefinition(
        configContent,
        namespaceName
      );

      if (configExists && !force) {
        this.logger.info(
          `apiNamespace config already exists in ${configFilePath}`
        );
        this.logger.info('Use --force to overwrite');
      } else {
        const definition = this.getDefinition(
          namespaceName,
          importPath,
          apiPath
        );

        this.featureGenerator.updateFeatureConfig(featurePath, definition);
        this.logger.success(
          `${configExists ? 'Updated' : 'Added'} apiNamespace config in: ${configFilePath}`
        );
      }

      this.logger.success(
        `\napiNamespace ${namespaceName} processing complete.`
      );
    } catch (error: any) {
      this.logger.error(
        'Failed to generate apiNamespace: ' + (error?.stack || error)
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
