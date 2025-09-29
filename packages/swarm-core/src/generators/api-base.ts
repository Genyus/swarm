import path from 'node:path';
import { BaseGenerator } from './base';

/**
 * Base class for API-related generators that need middleware functionality
 */
export abstract class ApiBaseGenerator<
  TFlags = any,
> extends BaseGenerator<TFlags> {
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
