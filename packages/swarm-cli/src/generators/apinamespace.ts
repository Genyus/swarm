import path from 'path';
import { ApiNamespaceFlags } from '../types';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import {
  ensureDirectoryExists,
  getFeatureTargetDir,
} from '../utils/filesystem';
import { toCamelCase } from '../utils/strings';
import { TemplateUtility } from '../utils/templates';

export class ApiNamespaceGenerator implements NodeGenerator<ApiNamespaceFlags> {
  private templateUtility: TemplateUtility;

  constructor(
    public logger: Logger,
    public fs: IFileSystem,
    private featureGenerator: IFeatureGenerator
  ) {
    this.templateUtility = new TemplateUtility(fs);
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
      const configExists = configContent.includes(`${namespaceName}: {`);
      if (configExists && !force) {
        this.logger.info(`apiNamespace config already exists in ${configPath}`);
        this.logger.info('Use --force to overwrite');
      } else {
        this.featureGenerator.updateFeatureConfig(featurePath, 'apiNamespace', {
          namespaceName,
          middlewareFnName,
          importPath,
          path: apiPath,
        });
        this.logger.success(
          `${configExists ? 'Updated' : 'Added'} apiNamespace config in: ${configPath}`
        );
      }
      this.logger.success(
        `\napiNamespace ${namespaceName} processing complete.`
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.logger.error('Failed to generate apiNamespace: ' + error.stack);
    }
  }
}
