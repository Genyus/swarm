import path from 'node:path';
import { CrudFlags, CrudOperation } from '../types';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import {
  ensureDirectoryExists,
  getFeatureDir,
  getFeatureTargetDir,
} from '../utils/filesystem';
import { getPlural, hasHelperMethodCall } from '../utils/strings';
import { TemplateUtility } from '../utils/templates';

const CRUD_OPERATIONS: readonly CrudOperation[] = [
  'get',
  'getAll',
  'create',
  'update',
  'delete',
] as const;

export class CrudGenerator implements NodeGenerator<CrudFlags> {
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

  private buildOperations(flags: CrudFlags): Record<string, unknown> {
    const {
      public: publicOps = [],
      override: overrideOps = [],
      exclude: excludeOps = [],
      dataType,
    } = flags;

    return CRUD_OPERATIONS.reduce(
      (acc, operation) => {
        if (excludeOps.includes(operation)) {
          return acc;
        }

        const operationConfig: Record<string, unknown> = {};

        if (publicOps.includes(operation)) {
          operationConfig.isPublic = true;
        }

        if (overrideOps.includes(operation)) {
          const operationDataType =
            operation === 'getAll' ? getPlural(dataType) : dataType;

          operationConfig.overrideFn = `import { ${operation}${operationDataType} } from '@src/operations/${operation}.js'`;
        }

        acc[operation] = operationConfig;

        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  async generate(featurePath: string, flags: CrudFlags): Promise<void> {
    try {
      const { dataType, force } = flags;
      const pluralName = getPlural(dataType);
      const crudName = pluralName;
      const crudsDir = getFeatureTargetDir(
        this.fs,
        featurePath,
        'crud'
      ).targetDirectory;

      ensureDirectoryExists(this.fs, crudsDir);

      const crudFile = `${crudsDir}/${crudName}.ts`;
      const fileExists = this.fs.existsSync(crudFile);

      if (fileExists && !force) {
        this.logger.info(`CRUD file already exists: ${crudFile}`);
        this.logger.info('Use --force to overwrite');

        return;
      }

      const templatePath = this.templateUtility.getFileTemplatePath('crud');

      if (!this.fs.existsSync(templatePath)) {
        this.logger.error('CRUD template not found');

        return;
      }

      const template = this.fs.readFileSync(templatePath, 'utf8');
      const operations = this.buildOperations(flags);
      const crudCode = this.templateUtility.processTemplate(template, {
        crudName,
        dataType,
        operations: JSON.stringify(operations, null, 2),
      });

      this.fs.writeFileSync(crudFile, crudCode);
      this.logger.success(
        `${fileExists ? 'Overwrote' : 'Generated'} CRUD file: ${crudFile}`
      );

      const featureName = featurePath.split('/')[0];
      const featureDir = getFeatureDir(this.fs, featureName);
      const configPath = path.join(featureDir, `${featureName}.wasp.ts`);

      if (!this.fs.existsSync(configPath)) {
        this.logger.error(`Feature config file not found: ${configPath}`);

        return;
      }

      const configContent = this.fs.readFileSync(configPath, 'utf8');
      const configExists = hasHelperMethodCall(
        configContent,
        'addCrud',
        crudName
      );

      if (configExists && !force) {
        this.logger.info(`CRUD config already exists in ${configPath}`);
        this.logger.info('Use --force to overwrite');

        return;
      }

      const definition = this.getDefinition(crudName, dataType, operations);

      this.featureGenerator.updateFeatureConfig(featurePath, definition);
      this.logger.success(
        `${configExists ? 'Updated' : 'Added'} CRUD config in: ${configPath}`
      );
      this.logger.info(`\nCRUD ${crudName} processing complete.`);
    } catch (error: any) {
      this.logger.error('Failed to generate CRUD: ' + (error?.stack || error));
    }
  }

  /**
   * Generates a CRUD definition for the feature configuration.
   */
  getDefinition(crudName: string, dataType: string, operations: any): string {
    const templatePath = this.templateUtility.getConfigTemplatePath('crud');
    const template = this.fs.readFileSync(templatePath, 'utf8');
    const operationsStr = JSON.stringify(operations, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .split('\n')
      .map((line, index) => (index === 0 ? line : '        ' + line))
      .join('\n');

    return this.templateUtility.processTemplate(template, {
      crudName,
      dataType,
      operations: operationsStr,
    });
  }
}
