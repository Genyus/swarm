import path from 'node:path';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import {
  ensureDirectoryExists,
  getFeatureDir,
  getFeatureTargetDir,
} from '../utils/filesystem';
import { hasHelperMethodCall } from '../utils/strings';
import { TemplateUtility } from '../utils/templates';

/**
 * Abstract base class for all generators that provides common functionality
 * and reduces code duplication across generator implementations.
 */
export abstract class BaseGenerator<TFlags = any>
  implements NodeGenerator<TFlags>
{
  protected templateUtility: TemplateUtility;

  constructor(
    public logger: Logger,
    public fs: IFileSystem,
    protected featureGenerator: IFeatureGenerator
  ) {
    this.templateUtility = new TemplateUtility(fs);
  }

  /**
   * Abstract method that each generator must implement for their specific generation logic
   */
  abstract generate(featurePath: string, flags: TFlags): Promise<void> | void;

  /**
   * Checks if a file exists and handles force flag logic
   * @param filePath - Path to the file to check
   * @param force - Whether to force overwrite
   * @param fileType - Type of file for error messages (e.g., 'CRUD file', 'API file')
   * @returns true if file can be written to, false if it exists and force is false
   * @throws Error if file exists and force is false
   */
  protected checkFileExists(
    filePath: string,
    force: boolean,
    fileType: string
  ): boolean {
    const fileExists = this.fs.existsSync(filePath);

    if (fileExists && !force) {
      this.logger.error(`${fileType} already exists: ${filePath}`);
      this.logger.error('Use --force to overwrite');
      throw new Error(`${fileType} already exists`);
    }

    return fileExists;
  }

  /**
   * Safely writes a file with proper error handling and logging
   * @param filePath - Path where to write the file
   * @param content - Content to write
   * @param fileType - Type of file for logging messages
   * @param fileExists - Whether the file already existed (for logging)
   */
  protected writeFile(
    filePath: string,
    content: string,
    fileType: string,
    fileExists: boolean
  ): void {
    this.fs.writeFileSync(filePath, content);
    this.logger.success(
      `${fileExists ? 'Overwrote' : 'Generated'} ${fileType}: ${filePath}`
    );
  }

  /**
   * Validates that the feature config file exists
   * @param featurePath - Path to the feature
   * @returns Path to the config file
   * @throws Error if config file doesn't exist
   */
  protected validateFeatureConfig(featurePath: string): string {
    const featureName = featurePath.split('/')[0];
    const featureDir = getFeatureDir(this.fs, featureName);
    const configPath = path.join(featureDir, `${featureName}.wasp.ts`);

    if (!this.fs.existsSync(configPath)) {
      this.logger.error(`Feature config file not found: ${configPath}`);
      throw new Error('Feature config file not found');
    }

    return configPath;
  }

  /**
   * Checks if a config item already exists in the feature config
   * @param configPath - Path to the config file
   * @param methodName - Name of the helper method (e.g., 'addCrud', 'addApi')
   * @param itemName - Name of the item to check for
   * @param force - Whether to force overwrite
   * @returns true if config exists, false otherwise
   * @throws Error if config exists and force is false
   */
  protected checkConfigExists(
    configPath: string,
    methodName: string,
    itemName: string,
    force: boolean
  ): boolean {
    const configContent = this.fs.readFileSync(configPath, 'utf8');
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
   * @param featurePath - Path to the feature
   * @param definition - The definition to add/update
   * @param configPath - Path to the config file
   * @param configExists - Whether the config already existed
   * @param methodName - Name of the method for logging
   */
  protected updateFeatureConfig(
    featurePath: string,
    definition: string,
    configPath: string,
    configExists: boolean,
    methodName: string
  ): void {
    this.featureGenerator.updateFeatureConfig(featurePath, definition);
    this.logger.success(
      `${configExists ? 'Updated' : 'Added'} ${methodName} config in: ${configPath}`
    );
  }

  /**
   * Processes a template and writes the result to a file
   * @param templatePath - Path to the template file
   * @param replacements - Object with template replacements
   * @param outputPath - Path where to write the processed template
   * @param readableFileType - Human readable file type for logging
   * @param force - Whether to force overwrite
   * @returns true if file was overwritten, false if newly created
   */
  protected renderTemplateToFile(
    templatePath: string,
    replacements: Record<string, any>,
    outputPath: string,
    readableFileType: string,
    force: boolean
  ): boolean {
    const fileExists = this.checkFileExists(
      outputPath,
      force,
      readableFileType
    );

    const content = this.templateUtility.processTemplate(
      templatePath,
      replacements
    );
    this.writeFile(outputPath, content, readableFileType, fileExists);

    return fileExists;
  }

  /**
   * Ensures a target directory exists and returns its path
   * @param featurePath - Path to the feature
   * @param type - Type of directory (e.g., 'crud', 'api', 'job')
   * @returns Object with targetDirectory and importDirectory
   */
  protected ensureTargetDirectory(featurePath: string, type: string) {
    const { targetDirectory, importDirectory } = getFeatureTargetDir(
      this.fs,
      featurePath,
      type
    );

    ensureDirectoryExists(this.fs, targetDirectory);

    return { targetDirectory, importDirectory };
  }

  /**
   * Standardized error handling wrapper for generator methods
   * @param itemType - Description of the operation for error messages
   * @param fn - Function to execute
   */
  protected async handleGeneratorError<T>(
    itemType: string,
    itemName: string,
    fn: () => Promise<T> | T
  ): Promise<T> {
    try {
      const result = await fn();

      this.logCompletion(itemType, itemName);

      return result;
    } catch (error: any) {
      this.logger.error(
        `Failed to generate ${itemType}: ${error?.stack || error}`
      );
      throw error;
    }
  }

  /**
   * Logs completion message for a generator
   * @param itemType - Type of item generated (e.g., 'CRUD', 'API', 'Job')
   * @param itemName - Name of the generated item
   */
  protected logCompletion(itemType: string, itemName: string): void {
    this.logger.success(`\n${itemType} ${itemName} processing complete.`);
  }
}
