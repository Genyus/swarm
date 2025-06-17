import { CrudFlags } from '../types';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import {
  ensureDirectoryExists,
  getFeatureTargetDir,
} from '../utils/filesystem';
import { getFileTemplatePath, processTemplate } from '../utils/templates';

const CRUD_OPERATIONS = [
  'get',
  'getAll',
  'create',
  'update',
  'delete',
] as const;

export class CrudGenerator implements NodeGenerator<CrudFlags> {
  constructor(
    public logger: Logger,
    public fs: IFileSystem,
    private featureGenerator: IFeatureGenerator
  ) {}

  async generate(featurePath: string, flags: CrudFlags): Promise<void> {
    try {
      const { dataType, force } = flags;
      const pluralName = dataType.endsWith('y')
        ? `${dataType.slice(0, -1)}ies`
        : `${dataType}s`;
      const crudName = pluralName;
      const { targetDir: crudsDir, importPath } = getFeatureTargetDir(
        this.fs,
        featurePath,
        'crud'
      );
      ensureDirectoryExists(this.fs, crudsDir);
      const crudFile = `${crudsDir}/${crudName}.ts`;
      const fileExists = this.fs.existsSync(crudFile);
      if (fileExists && !force) {
        this.logger.info(`CRUD file already exists: ${crudFile}`);
        this.logger.info('Use --force to overwrite');
        return;
      }
      // Use template for CRUD file
      const templatePath = getFileTemplatePath('crud');
      if (!this.fs.existsSync(templatePath)) {
        this.logger.error('CRUD template not found');
        return;
      }
      const template = this.fs.readFileSync(templatePath, 'utf8');
      const crudCode = processTemplate(template, {
        crudName,
        dataType,
        operations: JSON.stringify(CRUD_OPERATIONS, null, 2),
      });
      this.fs.writeFileSync(crudFile, crudCode);
      this.logger.success(
        `${fileExists ? 'Overwrote' : 'Generated'} CRUD file: ${crudFile}`
      );
      const configPath = `config/${featurePath.split('/')[0]}.wasp.ts`;
      if (!this.fs.existsSync(configPath)) {
        this.logger.error(`Feature config file not found: ${configPath}`);
        return;
      }
      const configContent = this.fs.readFileSync(configPath, 'utf8');
      const configExists = configContent.includes(`${crudName}: {`);
      if (configExists && !force) {
        this.logger.info(`CRUD config already exists in ${configPath}`);
        this.logger.info('Use --force to overwrite');
        return;
      }
      this.featureGenerator.updateFeatureConfig(featurePath, 'crud', {
        crudName,
        dataType,
        operations: CRUD_OPERATIONS,
        importPath,
      });
      this.logger.success(
        `${configExists ? 'Updated' : 'Added'} CRUD config in: ${configPath}`
      );
      this.logger.info(`\nCRUD ${crudName} processing complete.`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.logger.error('Failed to generate CRUD: ' + error.stack);
    }
  }
}
