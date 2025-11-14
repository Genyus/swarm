import {
  Generator,
  GeneratorServices,
  hasHelperMethodCall,
  StandardSchemaV1,
  toKebabCase,
  validateFeaturePath,
} from '@ingenyus/swarm';
import path from 'node:path';
import {
  ConfigType,
  ensureDirectoryExists,
  getFeatureDir,
  normaliseFeaturePath,
  TYPE_DIRECTORIES,
} from '../../common';
import { FeatureGenerator } from '../feature/feature-generator';
import { schema as featureSchema } from '../feature/schema';
import { WaspGeneratorBase } from './wasp-generator.base';

/**
 * Abstract base class for all Wasp component generators
 */
export abstract class ComponentGeneratorBase<
  S extends StandardSchemaV1,
  TConfig extends ConfigType,
> extends WaspGeneratorBase<S> {
  protected abstract componentType: TConfig;

  protected getDefaultTemplatePath(templateName: string): string {
    return this.templateUtility.resolveTemplatePath(
      templateName,
      this.name,
      import.meta.url
    );
  }

  protected featureDirectoryGenerator: Generator<typeof featureSchema>;

  constructor(services: GeneratorServices) {
    super(services);
    this.featureDirectoryGenerator = new FeatureGenerator(services);
  }

  public get name(): string {
    return toKebabCase(this.componentType);
  }

  /**
   * Validates that the feature config file exists in the target or ancestor directories
   */
  protected validateFeatureConfig(featurePath: string): string {
    const normalisedPath = normaliseFeaturePath(featurePath);
    const segments = normalisedPath.split('/');

    // Search from the target directory up through all ancestor feature directories
    for (let i = segments.length; i > 0; i--) {
      const pathSegments = segments.slice(0, i);
      const currentPath = pathSegments.join('/');
      const featureName = pathSegments[pathSegments.length - 1];

      const featureDir = getFeatureDir(this.fileSystem, currentPath);
      const configPath = path.join(featureDir, `feature.wasp.ts`);

      if (this.fileSystem.existsSync(configPath)) {
        return configPath;
      }
    }

    // No config file found in any ancestor directory
    this.logger.error(
      `Feature config file not found in '${normalisedPath}' or any ancestor directories`
    );
    this.logger.error(
      `Expected to find a feature.wasp.ts config file in one of the feature directories`
    );
    throw new Error('Feature config file not found');
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

    return this.checkExistence(
      configExists,
      `${methodName} config already exists in ${configPath}`,
      force,
      `${methodName} config already exists`
    );
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
   * Consolidated helper for updating config files with existence check
   * This replaces the duplicated updateConfigFile pattern in concrete generators
   */
  protected updateConfigWithCheck(
    configPath: string,
    methodName: string,
    entityName: string,
    definition: string,
    featurePath: string,
    force: boolean
  ): void {
    const configExists = this.checkConfigExists(
      configPath,
      methodName,
      entityName,
      force
    );

    if (!configExists || force) {
      this.updateFeatureConfig(
        featurePath,
        definition,
        configPath,
        configExists,
        methodName
      );
    }
  }

  /**
   * Gets the appropriate directory for a feature based on its path.
   * @param featurePath - The full feature path
   * @param type - The type of file being generated
   * @returns The target directory and import path
   */
  protected getFeatureTargetDir(
    featurePath: string,
    type: string
  ): { targetDirectory: string; importDirectory: string } {
    validateFeaturePath(featurePath);

    const normalisedPath = normaliseFeaturePath(featurePath);
    const featureDir = getFeatureDir(this.fileSystem, normalisedPath);
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
      featurePath,
      type
    );

    ensureDirectoryExists(this.fileSystem, targetDirectory);

    return { targetDirectory, importDirectory };
  }

  /**
   * Generate middleware file for API or API namespace
   */
  protected async generateMiddlewareFile(
    targetFile: string,
    name: string,
    force: boolean
  ): Promise<void> {
    const templatePath = this.templateUtility.resolveTemplatePath(
      'middleware/middleware.eta',
      'shared',
      import.meta.url
    );

    const fileExists = this.checkFileExists(
      targetFile,
      force,
      'Middleware file'
    );

    const content = this.templateUtility.processTemplate(templatePath, {
      name,
    });

    this.writeFile(targetFile, content, 'Middleware file', fileExists);
  }
}
