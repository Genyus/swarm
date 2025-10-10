import type { IFileSystem } from '@ingenyus/swarm-core';
import { Eta } from 'eta';
import path from 'path';

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
    const templateDir = path.dirname(templatePath);
    const eta = new Eta({
      autoTrim: false,
      autoEscape: false,
      views: templateDir,
      functionHeader,
    });
    const templateName = path.basename(templatePath).replace(/\.eta$/, '');

    if (this.fileSystem.existsSync(templatePath)) {
      return eta.render(templateName, replacements);
    } else {
      // For testing purposes, we read the template from the file system
      const template = this.fileSystem.readFileSync(templatePath, 'utf8');
      return eta.renderString(template, replacements);
    }
  }
}
