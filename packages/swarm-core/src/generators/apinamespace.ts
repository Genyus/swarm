import path from 'node:path';
import { ApiNamespaceFlags } from '../types';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import {
  ensureDirectoryExists,
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
      const middlewareFnName = `${name}Middleware`;
      const { targetDirectory: middlewareDir, importDirectory } =
        getFeatureTargetDir(this.fs, featurePath, 'middleware');
      const importPath = path.join(importDirectory, middlewareFnName);
      ensureDirectoryExists(this.fs, middlewareDir);
      const middlewareFile = `${middlewareDir}/${middlewareFnName}.ts`;
      const fileExists = this.fs.existsSync(middlewareFile);

      if (fileExists && !force) {
        this.logger.info(`Middleware file already exists: ${middlewareFile}`);
        this.logger.info('Use --force to overwrite');
      } else {
        const templatePath =
          this.templateUtility.getFileTemplatePath('middleware');
        if (!this.fs.existsSync(templatePath)) {
          this.logger.error('Middleware template not found');
          return;
        }
        const template = this.fs.readFileSync(templatePath, 'utf8');
        const processed = this.templateUtility.processTemplate(template, {
          middlewareFnName,
          namespaceName,
        });
        this.fs.writeFileSync(middlewareFile, processed);
        this.logger.success(
          `${fileExists ? 'Overwrote' : 'Generated'} middleware file: ${middlewareFile}`
        );
      }

      const configPath = `config/${featurePath.split('/')[0]}.wasp.ts`;

      if (!this.fs.existsSync(configPath)) {
        this.logger.error(`Feature config file not found: ${configPath}`);
        return;
      }

      const configContent = this.fs.readFileSync(configPath, 'utf8');
      const configExists = hasApiNamespaceDefinition(
        configContent,
        namespaceName
      );

      if (configExists && !force) {
        this.logger.info(`apiNamespace config already exists in ${configPath}`);
        this.logger.info('Use --force to overwrite');
      } else {
        const definition = this.getDefinition(
          namespaceName,
          middlewareFnName,
          importPath,
          apiPath
        );

        this.featureGenerator.updateFeatureConfig(featurePath, definition);
        this.logger.success(
          `${configExists ? 'Updated' : 'Added'} apiNamespace config in: ${configPath}`
        );
      }

      this.logger.success(
        `\napiNamespace ${namespaceName} processing complete.`
      );
    } catch (error: any) {
      this.logger.error('Failed to generate apiNamespace: ' + error.stack);
    }
  }

  /**
   * Generates an apiNamespace definition for the feature configuration.
   */
  getDefinition(
    namespaceName: string,
    middlewareFnName: string,
    middlewareImportPath: string,
    pathValue: string
  ): string {
    const templatePath =
      this.templateUtility.getConfigTemplatePath('apiNamespace');
    const template = this.fs.readFileSync(templatePath, 'utf8');

    return this.templateUtility.processTemplate(template, {
      namespaceName,
      middlewareFnName,
      middlewareImportPath,
      pathValue,
    });
  }
}
