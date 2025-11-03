import {
  FileSystem,
  GeneratorBase,
  Logger,
  logger as singletonLogger,
  SwarmConfig,
  SwarmConfigManager,
  TemplateResolver,
} from '@ingenyus/swarm';
import { ZodType } from 'zod';
import { realFileSystem, TemplateUtility } from '../../common';
import { PLUGIN_NAME } from '../../types';
import { WaspConfigGenerator } from '../config';

/**
 * Abstract base class for all Wasp generators
 */
export abstract class WaspGeneratorBase<
  S extends ZodType,
> extends GeneratorBase<S> {
  protected configGenerator: WaspConfigGenerator;
  protected templateUtility: TemplateUtility;
  protected templateResolver: TemplateResolver;
  private swarmConfig: SwarmConfig | undefined;
  private configLoaded = false;

  // Plugin name from swarm.config.json
  protected readonly pluginName = PLUGIN_NAME;

  constructor(
    public fileSystem: FileSystem = realFileSystem,
    public logger: Logger = singletonLogger
  ) {
    super(fileSystem, logger);
    this.configGenerator = new WaspConfigGenerator(logger, fileSystem);
    this.templateUtility = new TemplateUtility(fileSystem);
    this.templateResolver = new TemplateResolver(fileSystem);
  }

  private async loadSwarmConfig(): Promise<void> {
    if (this.configLoaded) return;

    const configManager = new SwarmConfigManager();

    this.swarmConfig = await configManager.loadConfig();
    this.configLoaded = true;
  }

  protected async getCustomTemplateDir(): Promise<string | undefined> {
    await this.loadSwarmConfig();

    return this.swarmConfig?.templateDirectory;
  }

  /**
   * Abstract method to resolve templates relative to the implementing generator class
   * @param templateName - The name of the template file (e.g., 'api.eta')
   * @returns The full path to the template file
   */
  protected abstract getDefaultTemplatePath(templateName: string): string;

  /**
   * Resolves template path with override support
   */
  protected async getTemplatePath(templateName: string): Promise<string> {
    const defaultPath = this.getDefaultTemplatePath(templateName);
    const customPath = await this.getCustomTemplateDir();

    if (!customPath) {
      return defaultPath;
    }

    const { path: resolvedPath, isCustom } =
      this.templateResolver.resolveTemplatePath(
        this.pluginName,
        this.name,
        templateName,
        defaultPath,
        customPath
      );

    if (isCustom) {
      this.logger.info(`Using custom template: ${resolvedPath}`);
    }

    return resolvedPath;
  }

  /**
   * Processes a template and writes the result to a file
   */
  protected async renderTemplateToFile(
    templateName: string,
    replacements: Record<string, any>,
    outputPath: string,
    readableFileType: string,
    force: boolean
  ): Promise<boolean> {
    const templatePath = await this.getTemplatePath(templateName);
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
   * Consolidates the pattern used in both file and config existence checks
   */
  protected checkExistence(
    exists: boolean,
    itemDescription: string,
    force: boolean,
    errorMessage?: string
  ): boolean {
    if (exists && !force) {
      this.logger.error(`${itemDescription}. Use --force to overwrite`);
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
