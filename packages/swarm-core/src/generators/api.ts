import path from 'path';
import { ApiFlags } from '../types';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import {
  ensureDirectoryExists,
  getFeatureDir,
  getFeatureImportPath,
  getFeatureTargetDir,
} from '../utils/filesystem';
import {
  hasHelperMethodCall,
  toCamelCase,
  toPascalCase,
} from '../utils/strings';
import { TemplateUtility } from '../utils/templates';

export class ApiGenerator implements NodeGenerator<ApiFlags> {
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

  async generate(featurePath: string, flags: ApiFlags): Promise<void> {
    try {
      let baseName = toCamelCase(flags.name);

      if (baseName.toLowerCase().endsWith('api')) {
        baseName = baseName.slice(0, -3);
      }

      const apiName = baseName + 'Api';
      const apiFile = `${baseName}.ts`;
      const apiType = toPascalCase(apiName);
      const {
        method,
        route,
        entities = [],
        auth = false,
        force = false,
      } = flags;
      const { targetDirectory: apiDir, importDirectory } = getFeatureTargetDir(
        this.fs,
        featurePath,
        'api'
      );
      const importPath = path.join(importDirectory, apiFile);

      ensureDirectoryExists(this.fs, apiDir);

      const handlerFile = `${apiDir}/${apiFile}`;
      const fileExists = this.fs.existsSync(handlerFile);

      if (fileExists && !force) {
        this.logger.info(`API endpoint file already exists: ${handlerFile}`);
        this.logger.info('Use --force to overwrite');
      } else {
        const templatePath = this.templateUtility.getFileTemplatePath('api');
        if (!this.fs.existsSync(templatePath)) {
          const message = 'API endpoint template not found';

          this.logger.error(message);

          throw new Error(message);
        }
        const template = this.fs.readFileSync(templatePath, 'utf8');
        const authCheck = auth
          ? `  if (!context.user) {
    throw new HttpError(401);
  }

`
          : '';
        const methodCheck =
          method !== 'ALL'
            ? `  if (req.method !== '${method}') {
    throw new HttpError(405);
  }

`
            : '';
        const errorImport =
          auth || method !== 'ALL'
            ? 'import { HttpError } from "wasp/server";\n'
            : '';
        const imports = `${errorImport}import type { ${apiType} } from "wasp/server/api";`;
        const processed = this.templateUtility.processTemplate(template, {
          imports,
          apiType,
          apiName,
          methodCheck,
          authCheck,
        });
        this.fs.writeFileSync(handlerFile, processed);
        this.logger.success(
          `${fileExists ? 'Overwrote' : 'Generated'} API endpoint file: ${handlerFile}`
        );
      }

      const configFilePrefix = featurePath.split('/').join('.');
      const configDir = getFeatureDir(this.fs, configFilePrefix);
      const configFilePath = path.join(
        configDir,
        `${configFilePrefix}.wasp.ts`
      );

      if (!this.fs.existsSync(configFilePath)) {
        const message = `Feature config file not found: ${configFilePath}`;

        this.logger.error(message);

        throw new Error(message);
      }

      const configContent = this.fs.readFileSync(configFilePath, 'utf8');
      const configExists = hasHelperMethodCall(
        configContent,
        'addApi',
        apiName
      );

      if (configExists && !force) {
        this.logger.info(`API config already exists in ${configFilePath}`);
        this.logger.info('Use --force to overwrite');
      } else {
        const definition = this.getDefinition(
          apiName,
          featurePath,
          Array.isArray(entities) ? entities : entities ? [entities] : [],
          method,
          route,
          apiFile,
          auth,
          importPath
        );
        this.featureGenerator.updateFeatureConfig(featurePath, definition);
        this.logger.success(
          `${configExists ? 'Updated' : 'Added'} API config in: ${configFilePath}`
        );
      }

      this.logger.info(`\nAPI ${apiName} processing complete.`);
    } catch (error: any) {
      this.logger.error('Failed to generate API: ' + error.stack);
    }
  }

  /**
   * Generates an API definition for the feature configuration.
   */
  getDefinition(
    apiName: string,
    featurePath: string,
    entities: string[],
    method: string,
    route: string,
    apiFile: string,
    auth = false,
    importPath: string
  ): string {
    const featureDir = getFeatureImportPath(featurePath);
    const templatePath = this.templateUtility.getConfigTemplatePath('api');
    const template = this.fs.readFileSync(templatePath, 'utf8');

    return this.templateUtility.processTemplate(template, {
      apiName,
      featureDir,
      entities: entities.map((e) => `"${e}"`).join(', '),
      method,
      route,
      apiFile,
      auth: String(auth),
      importPath,
    });
  }
}
