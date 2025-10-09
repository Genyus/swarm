import {
  hasHelperMethodCall,
  IFileSystem,
  Logger,
  SwarmLogger,
  toCamelCase,
  toKebabCase,
  validateFeaturePath,
} from '@ingenyus/swarm-core';
import path from 'node:path';
import { FeatureDirectoryGenerator } from '../generators/feature-directory/generator';
import { IFeatureDirectoryGenerator } from '../interfaces/feature-directory-generator';
import { ConfigType, GetFlagsType, TYPE_DIRECTORIES } from '../types/constants';
import {
  ensureDirectoryExists,
  getFeatureDir,
  getFeatureImportPath,
  normaliseFeaturePath,
  realFileSystem,
} from '../utils/filesystem';
import { BaseWaspGenerator } from './base-wasp-generator';

/**
 * Abstract base class for all generators
 */
export abstract class BaseEntityGenerator<
  TArgs extends ConfigType,
> extends BaseWaspGenerator<TArgs> {
  protected abstract entityType: TArgs;

  protected getTemplatePath(templateName: string): string {
    return this.resolveTemplatePath(templateName, this.name, import.meta.url);
  }

  constructor(
    public logger: Logger = new SwarmLogger(),
    public fileSystem: IFileSystem = realFileSystem,
    protected featureDirectoryGenerator: IFeatureDirectoryGenerator = new FeatureDirectoryGenerator(
      logger,
      fileSystem
    )
  ) {
    super(fileSystem, logger);
    // Set the featureGenerator for the base class
    this.featureDirectoryGenerator = featureDirectoryGenerator;
  }

  public get name(): string {
    return toKebabCase(this.entityType.toString());
  }

  public abstract generate(flags: GetFlagsType<TArgs>): Promise<void> | void;

  protected getFeatureImportPath(featurePath: string): string {
    return getFeatureImportPath(featurePath);
  }

  /**
   * Validates that the feature config file exists
   */
  protected validateFeatureConfig(featurePath: string): string {
    const normalisedPath = normaliseFeaturePath(featurePath);
    const segments = normalisedPath.split('/');
    const featureName = segments[segments.length - 1];

    const featureDir = getFeatureDir(this.fileSystem, normalisedPath);
    const configPath = path.join(featureDir, `${featureName}.wasp.ts`);

    if (!this.fileSystem.existsSync(configPath)) {
      this.logger.error(`Feature config file not found: ${configPath}`);
      throw new Error('Feature config file not found');
    }

    return configPath;
  }

  /**
   * Checks if a config item already exists in the feature config
   */
  protected checkConfigExists(
    configPath: string,
    methodName: string,
    itemName: string,
    force: boolean
  ): boolean {
    const configContent = this.fileSystem.readFileSync(configPath, 'utf8');
    const configExists = hasHelperMethodCall(
      configContent,
      methodName,
      itemName
    );

    if (configExists && !force) {
      this.logger.error(`${methodName} config already exists in ${configPath}`);
      this.logger.error('Use --force to overwrite');
      throw new Error(`${methodName} config already exists`);
    }

    return configExists;
  }

  /**
   * Updates the feature config with a new definition
   */
  protected updateFeatureConfig(
    featurePath: string,
    definition: string,
    configPath: string,
    configExists: boolean,
    methodName: string
  ): void {
    this.configGenerator.update(featurePath, definition);
    this.logger.success(
      `${configExists ? 'Updated' : 'Added'} ${methodName} config in: ${configPath}`
    );
  }

  /**
   * Gets the appropriate directory for a feature based on its path.
   * @param fileSystem - The filesystem abstraction
   * @param featurePath - The full feature path
   * @param type - The type of file being generated
   * @returns The target directory and import path
   */
  protected getFeatureTargetDir(
    fileSystem: IFileSystem,
    featurePath: string,
    type: string
  ): { targetDirectory: string; importDirectory: string } {
    validateFeaturePath(featurePath);

    const normalisedPath = normaliseFeaturePath(featurePath);
    const featureDir = getFeatureDir(fileSystem, normalisedPath);
    const typeKey = type.toLowerCase();
    const typeDirectory = TYPE_DIRECTORIES[typeKey];
    const targetDirectory = path.join(featureDir, typeDirectory);
    const importDirectory = `@src/${normalisedPath}/${typeDirectory}`;

    return { targetDirectory, importDirectory };
  }

  /**
   * Ensures a target directory exists and returns its path
   */
  protected ensureTargetDirectory(featurePath: string, type: string) {
    const { targetDirectory, importDirectory } = this.getFeatureTargetDir(
      this.fileSystem,
      featurePath,
      type
    );

    ensureDirectoryExists(this.fileSystem, targetDirectory);

    return { targetDirectory, importDirectory };
  }

  /**
   * Generate middleware file for API or API namespace
   */
  protected generateMiddlewareFile(
    targetFile: string,
    name: string,
    force: boolean
  ): void {
    const replacements = {
      name,
      middlewareType: toCamelCase(this.entityType || ''),
    };

    this.renderTemplateToFile(
      'middleware.eta',
      replacements,
      targetFile,
      'Middleware file',
      force
    );
  }
}
