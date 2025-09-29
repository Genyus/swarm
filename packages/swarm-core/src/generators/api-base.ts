import path from 'node:path';
import { Logger } from '../types';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator } from '../types/generator';
import { BaseGenerator } from './base';

/**
 * Base class for API-related generators that need middleware functionality
 */
export abstract class ApiBaseGenerator<
  TFlags = any,
> extends BaseGenerator<TFlags> {
  constructor(
    logger: Logger,
    fs: IFileSystem,
    protected featureGenerator: IFeatureGenerator
  ) {
    super(logger, fs, featureGenerator);
  }

  /**
   * Generate middleware file for API or API namespace
   */
  protected generateMiddlewareFile(
    targetFile: string,
    name: string,
    middlewareType: 'apiNamespace' | 'api',
    force: boolean
  ): void {
    const templatePath = path.join(
      'files',
      'server',
      'middleware',
      'middleware.eta'
    );
    const replacements = {
      name,
      middlewareType,
    };

    this.renderTemplateToFile(
      templatePath,
      replacements,
      targetFile,
      'Middleware file',
      force
    );
  }
}
