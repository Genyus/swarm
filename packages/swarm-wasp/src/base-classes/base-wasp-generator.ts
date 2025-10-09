import {
  BaseGenerator,
  IFileSystem,
  Logger,
  SwarmLogger,
  toKebabCase,
} from '@ingenyus/swarm-core';
import { WaspConfigGenerator } from '../generators/config/generator';
import { getFeatureImportPath, realFileSystem } from '../utils/filesystem';

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
  }

  protected configGenerator: WaspConfigGenerator;

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
  protected resolveTemplatePath(templateName: string, generatorName: string, currentFileUrl: string): string {
    const currentFileDir = this.path.dirname(new URL(currentFileUrl).pathname);

    // Determine the generator directory name
    const generatorDirName = toKebabCase(generatorName);

    // For installed packages, templates are in dist/generators/[generator]/templates/
    // For development, templates are in src/generators/[generator]/templates/
    const isInstalledPackage = currentFileDir.includes('node_modules');

    if (isInstalledPackage) {
      // When installed, currentFileDir is something like:
      // /Users/gary/Dev/TodoApp/node_modules/@ingenyus/swarm-wasp/dist/generators/job/
      // We need to go up to the dist directory and then to generators/[generator]/templates/
      const distDir = this.path.dirname(this.path.dirname(currentFileDir));
      return this.path.join(
        distDir,
        'generators',
        generatorDirName,
        'templates',
        templateName
      );
    } else {
      // In development, templates are in src/generators/[generator]/templates/
      const srcDir = this.path.dirname(
        this.path.dirname(currentFileDir)
      );
      return this.path.join(
        srcDir,
        'generators',
        generatorDirName,
        'templates',
        templateName
      );
    }
  }

  protected getFeatureImportPath(featurePath: string): string {
    return getFeatureImportPath(featurePath);
  }
}
