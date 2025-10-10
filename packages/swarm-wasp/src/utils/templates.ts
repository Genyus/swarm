import { toKebabCase, type IFileSystem } from '@ingenyus/swarm-core';
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

  /**
   * Helper method to resolve template paths for concrete generators
   * @param templateName - The name of the template file
   * @param generatorName - The name of the generator (e.g., 'api', 'job')
   * @param currentFileUrl - The import.meta.url from the concrete generator class
   * @returns The full path to the template file
   */
  public resolveTemplatePath(
    templateName: string,
    generatorName: string,
    currentFileUrl: string
  ): string {
    const generatorDirName = toKebabCase(generatorName);
    const currentFilePath = new URL(currentFileUrl).pathname;
    const currentFileDir = path.dirname(currentFilePath);
    const currentFileName = path.basename(currentFilePath);
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
      : path.dirname(currentFileDir);

    return path.join(
      startDir,
      'generators',
      generatorDirName,
      'templates',
      templateName
    );
  }
}
