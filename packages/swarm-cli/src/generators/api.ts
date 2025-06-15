import { ApiFlags } from '../types';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import {
  ensureDirectoryExists,
  getFeatureTargetDir,
} from '../utils/filesystem';
import { getFileTemplatePath, processTemplate } from '../utils/templates';

export class ApiGenerator implements NodeGenerator<ApiFlags> {
  constructor(
    public logger: Logger,
    public fs: IFileSystem,
    private featureGenerator: IFeatureGenerator
  ) {}

  async generate(featurePath: string, flags: ApiFlags): Promise<void> {
    try {
      let baseName = flags.name;
      if (!baseName.endsWith('Api')) {
        baseName = baseName + 'Api';
      }
      const apiName = baseName;
      const apiFile = `${apiName}.ts`;
      const ApiType = apiName.charAt(0).toUpperCase() + apiName.slice(1);
      const {
        method,
        route,
        entities = [],
        auth = false,
        force = false,
      } = flags;
      const { targetDir: apiDir, importPath } = getFeatureTargetDir(
        this.fs,
        featurePath,
        'api'
      );
      ensureDirectoryExists(this.fs, apiDir);
      const handlerFile = `${apiDir}/${apiFile}`;
      const fileExists = this.fs.existsSync(handlerFile);
      if (fileExists && !force) {
        this.logger.info(`API endpoint file already exists: ${handlerFile}`);
        this.logger.info('Use --force to overwrite');
      } else {
        const templatePath = getFileTemplatePath('api');
        if (!this.fs.existsSync(templatePath)) {
          this.logger.error('API endpoint template not found');
          return;
        }
        const template = this.fs.readFileSync(templatePath, 'utf8');
        const entitiesStr = Array.isArray(entities)
          ? entities.map((e: string) => `"${e}"`).join(', ')
          : entities
            ? `"${entities}"`
            : '';
        const processed = processTemplate(template, {
          ApiType,
          apiName,
          method,
          route,
          entities: entitiesStr,
          auth: String(auth),
        });
        this.fs.writeFileSync(handlerFile, processed);
        this.logger.success(
          `${fileExists ? 'Overwrote' : 'Generated'} API endpoint file: ${handlerFile}`
        );
      }
      const configPath = `config/${featurePath.split('/')[0]}.wasp.ts`;
      if (!this.fs.existsSync(configPath)) {
        this.logger.error(`Feature config file not found: ${configPath}`);
        return;
      }
      const configContent = this.fs.readFileSync(configPath, 'utf8');
      const configExists = configContent.includes(`${apiName}: {`);
      if (configExists && !force) {
        this.logger.info(`API config already exists in ${configPath}`);
        this.logger.info('Use --force to overwrite');
      } else {
        this.featureGenerator.updateFeatureConfig(featurePath, 'api', {
          apiName,
          entities,
          method,
          route,
          apiFile,
          auth,
          importPath,
        });
        this.logger.success(
          `${configExists ? 'Updated' : 'Added'} API config in: ${configPath}`
        );
      }
      this.logger.info(`\nAPI ${apiName} processing complete.`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.logger.error('Failed to generate API: ' + error.stack);
    }
  }
}
