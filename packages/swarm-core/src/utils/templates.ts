import { Eta } from 'eta';
import path from 'path';
import type { IFileSystem } from '../types/filesystem';
import { getTemplatesDir } from './filesystem';

export class TemplateUtility {
  constructor(private fileSystem: IFileSystem) {}

  processTemplate(
    templatePath: string,
    replacements: Record<string, string>
  ): string {
    const declarations = Object.keys(replacements)
      .map((key) => `${key}=it.${key}`)
      .join(', ');
    const functionHeader = declarations ? `const ${declarations};` : undefined;
    const eta = new Eta({
      tags: ['{{', '}}'],
      views: getTemplatesDir(this.fileSystem),
      functionHeader,
    });
    const templateName = templatePath.replace(/\.eta$/, '');
    const templatesDir = getTemplatesDir(this.fileSystem);
    const fullPath = path.join(templatesDir, templatePath);

    if (this.fileSystem.existsSync(fullPath)) {
      return eta.render(templateName, replacements);
    } else {
      // For testing purposes, we read the template from the file system
      const template = this.fileSystem.readFileSync(fullPath, 'utf8');

      return eta.renderString(template, replacements);
    }
  }
}
