import {
  BaseGenerator,
  IFileSystem,
  Logger,
  realFileSystem,
  SwarmLogger,
  toKebabCase,
} from '@ingenyus/swarm-core';
import { WaspConfigGenerator } from '../generators/config/generator';

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
   * Override getTemplatePath to resolve templates relative to the calling generator class
   * @param templateName - The name of the template file (e.g., 'api.eta')
   * @returns The full path to the template file
   */
  protected getTemplatePath(templateName: string): string {
    const srcDir = this.path.dirname(
      this.path.dirname(new URL(import.meta.url).pathname)
    );
    const generatorName =
      this.name == 'action' ||
      this.name == 'query' ||
      (this.name === 'crud' && !templateName.includes('crud'))
        ? 'operation'
        : this.name;
    const generatorDirName = toKebabCase(generatorName);

    return this.path.join(
      srcDir,
      'generators',
      generatorDirName,
      'templates',
      templateName
    );
  }
}
