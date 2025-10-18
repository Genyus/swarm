import path from 'path';
import { FileSystem } from '../types';

export const DEFAULT_TEMPLATE_DIR = '.swarm/templates';

export class TemplateResolver {
  constructor(private fileSystem: FileSystem) {}

  /**
   * Resolves template path
   * @param pluginName - Plugin name from config (e.g., 'wasp', 'nextjs')
   * @param generatorName - Generator name (e.g., 'api', 'crud')
   * @param templateName - Template file name (e.g., 'api.eta', 'config/api.eta')
   * @param builtInTemplatePath - Absolute path to built-in template
   * @param customTemplateDir - Custom template directory from config (default: '.swarm/templates')
   * @returns Resolved template path and whether it's custom
   */
  public resolveTemplatePath(
    pluginName: string,
    generatorName: string,
    templateName: string,
    builtInTemplatePath: string,
    customTemplateDir?: string
  ): { path: string; isCustom: boolean } {
    const templateDir = customTemplateDir || DEFAULT_TEMPLATE_DIR;
    const customPath = path.join(
      process.cwd(),
      templateDir,
      pluginName,
      generatorName,
      templateName
    );

    if (this.fileSystem.existsSync(customPath)) {
      this.validateTemplate(customPath);

      return { path: customPath, isCustom: true };
    }

    return { path: builtInTemplatePath, isCustom: false };
  }

  /**
   * Validates template file syntax
   */
  public validateTemplate(templatePath: string): boolean {
    if (!this.fileSystem.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    try {
      const content = this.fileSystem.readFileSync(templatePath, 'utf8');
      const openTags = (content.match(/<%/g) || []).length;
      const closeTags = (content.match(/%>/g) || []).length;

      if (openTags !== closeTags) {
        throw new Error(`Template has unclosed tags: ${templatePath}`);
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(
        `Template validation failed for ${templatePath}: ${message}`
      );
    }
  }
}
