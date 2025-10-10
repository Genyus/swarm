import {
  BaseGenerator,
  IFileSystem,
  Logger,
  SwarmLogger,
  toKebabCase,
} from '@ingenyus/swarm-core';
import { WaspConfigGenerator } from '../generators/config/generator';
import { getFeatureImportPath, realFileSystem } from '../utils/filesystem';
import { TemplateUtility } from '../utils/templates';

/**
 * Abstract base class for all generators
 */
export abstract class BaseWaspGenerator<TArgs> extends BaseGenerator<TArgs> {
  constructor(
    public fileSystem: IFileSystem = realFileSystem,
    public logger: Logger = new SwarmLogger()
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
   * Helper method to resolve template paths for concrete generators
   * @param templateName - The name of the template file
   * @param generatorName - The name of the generator (e.g., 'api', 'job')
   * @param currentFileUrl - The import.meta.url from the concrete generator class
   * @returns The full path to the template file
   */
  protected resolveTemplatePath(
    templateName: string,
    generatorName: string,
    currentFileUrl: string
  ): string {
    const generatorDirName = toKebabCase(generatorName);
    const currentFilePath = new URL(currentFileUrl).pathname;
    const currentFileDir = this.path.dirname(currentFilePath);
    const currentFileName = this.path.basename(currentFilePath);
    const isInstalledPackage =
      currentFileDir.includes('node_modules') &&
      currentFileDir.endsWith('/dist') &&
      currentFileName === 'index.js';
    // When bundled, currentFileDir is:
    // [app root]/node_modules/@ingenyus/swarm-wasp/dist
    // Templates are in dist/generators/[generator]/templates/
    // In development, currentFileDir is:
    // [project root]/packages/swarm-wasp/src/base-classes/
    // We need to go up to the src directory and then to generators/[generator]/templates/
    const startDir = isInstalledPackage
      ? currentFileDir
      : this.path.dirname(currentFileDir);

    return this.path.join(
      startDir,
      'generators',
      generatorDirName,
      'templates',
      templateName
    );
  }

  protected getFeatureImportPath(featurePath: string): string {
    return getFeatureImportPath(featurePath);
  }

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
   * Checks if a file exists and handles force flag logic
   */
  protected checkFileExists(
    filePath: string,
    force: boolean,
    fileType: string
  ): boolean {
    const fileExists = this.fileSystem.existsSync(filePath);

    if (fileExists && !force) {
      this.logger.error(`${fileType} already exists: ${filePath}`);
      this.logger.error('Use --force to overwrite');
      throw new Error(`${fileType} already exists`);
    }

    return fileExists;
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
