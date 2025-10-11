import {
  FileSystem,
  GeneratorBase,
  Logger,
  SignaleLogger,
} from '@ingenyus/swarm-core';
import { realFileSystem, TemplateUtility } from '../../common';
import { WaspConfigGenerator } from '../config';

/**
 * Abstract base class for all Wasp generators
 */
export abstract class WaspGeneratorBase<TArgs> extends GeneratorBase<TArgs> {
  constructor(
    public fileSystem: FileSystem = realFileSystem,
    public logger: Logger = new SignaleLogger()
  ) {
    super(fileSystem, logger);
    this.configGenerator = new WaspConfigGenerator(logger, fileSystem);
    this.templateUtility = new TemplateUtility(fileSystem);
  }

  protected configGenerator: WaspConfigGenerator;
  protected templateUtility: TemplateUtility;

  /**
   * Abstract method to resolve templates relative to the implementing generator class
   * @param templateName - The name of the template file (e.g., 'api.eta')
   * @returns The full path to the template file
   */
  protected abstract getTemplatePath(templateName: string): string;

  /**
   * Processes a template and writes the result to a file
   */
  protected renderTemplateToFile(
    templateName: string,
    replacements: Record<string, any>,
    outputPath: string,
    readableFileType: string,
    force: boolean
  ): boolean {
    const templatePath = this.getTemplatePath(templateName);
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
   * Generic existence check with force flag handling
   * Consolidates the pattern used in both file and config checks
   */
  protected checkExistence(
    exists: boolean,
    itemDescription: string,
    force: boolean,
    errorMessage?: string
  ): boolean {
    if (exists && !force) {
      this.logger.error(itemDescription);
      this.logger.error('Use --force to overwrite');
      throw new Error(errorMessage || itemDescription);
    }
    return exists;
  }

  /**
   * Checks if a file exists and handles force flag logic
   */
  protected checkFileExists(
    filePath: string,
    force: boolean,
    fileType: string
  ): boolean {
    const fileExists = this.fileSystem.existsSync(filePath);
    return this.checkExistence(
      fileExists,
      `${fileType} already exists: ${filePath}`,
      force,
      `${fileType} already exists`
    );
  }

  /**
   * Safely writes a file with proper error handling and logging
   */
  protected writeFile(
    filePath: string,
    content: string,
    fileType: string,
    fileExists: boolean
  ): void {
    this.fileSystem.writeFileSync(filePath, content);
    this.logger.success(
      `${fileExists ? 'Overwrote' : 'Generated'} ${fileType}: ${filePath}`
    );
  }
}
