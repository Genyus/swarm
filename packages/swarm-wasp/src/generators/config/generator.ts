import {
  handleFatalError,
  IFileSystem,
  Logger,
  parseHelperMethodDefinition,
  SwarmLogger,
} from '@ingenyus/swarm-core';
import path from 'node:path';
import { IWaspConfigGenerator } from '../../interfaces/wasp-config-generator';
import { getFeatureDir, realFileSystem } from '../../utils/filesystem';

export class WaspConfigGenerator implements IWaspConfigGenerator {
  protected path = path;

  constructor(
    protected logger: Logger = new SwarmLogger(),
    protected fileSystem: IFileSystem = realFileSystem
  ) {}

  /**
   * Gets the template path for feature config templates.
   * Feature config templates are located in the feature-directory generator's templates directory.
   * @param templateName - The name of the template file (e.g., 'feature.wasp.eta')
   * @returns The full path to the template file
   */
  private getTemplatePath(templateName: string): string {
    // Get the directory of the current generator class
    const generatorDir = this.path.dirname(new URL(import.meta.url).pathname);
    // Go up to the generators directory and then to feature-directory/templates
    const generatorsDir = this.path.dirname(generatorDir);
    return this.path.join(
      generatorsDir,
      'feature-directory',
      'templates',
      templateName
    );
  }

  /**
   * Generate a TypeScript Wasp config file in a feature directory
   * @param featurePath - The feature directory path
   */
  generate(featurePath: string): void {
    // Create feature directory if it doesn't exist
    const featureDir = getFeatureDir(this.fileSystem, featurePath);
    if (!this.fileSystem.existsSync(featureDir)) {
      this.fileSystem.mkdirSync(featureDir, { recursive: true });
    }

    // Generate feature config in the feature directory
    const templatePath = this.getTemplatePath('feature.wasp.eta');

    if (!this.fileSystem.existsSync(templatePath)) {
      this.logger.error(`Template not found: ${templatePath}`);
      return;
    }

    const configFilePrefix = featurePath.split('/').at(-1)!;
    const configFilePath = path.join(featureDir, `${configFilePrefix}.wasp.ts`);

    if (this.fileSystem.existsSync(configFilePath)) {
      this.logger.warn(`Feature config already exists: ${configFilePath}`);
      return;
    }

    this.fileSystem.copyFileSync(templatePath, configFilePath);
    this.logger.success(`Generated feature config: ${configFilePath}`);
  }

  /**
   * Updates or creates a feature configuration file with a pre-built declaration.
   * @param featurePath - The path to the feature
   * @param declaration - The pre-built declaration string to add or update
   * @returns The updated feature configuration file
   */
  update(featurePath: string, declaration: string): string {
    const configFilePrefix = featurePath.split('/').at(-1)!;
    const configDir = getFeatureDir(this.fileSystem, featurePath);
    const configFilePath = path.join(configDir, `${configFilePrefix}.wasp.ts`);

    if (!this.fileSystem.existsSync(configFilePath)) {
      const templatePath = this.getTemplatePath('feature.wasp.eta');

      if (!this.fileSystem.existsSync(templatePath)) {
        handleFatalError(`Feature config template not found: ${templatePath}`);
      }

      this.fileSystem.copyFileSync(templatePath, configFilePath);
    }

    let content = this.fileSystem.readFileSync(configFilePath, 'utf8');
    const parsed = parseHelperMethodDefinition(declaration);

    if (!parsed) {
      handleFatalError(`Could not parse definition: ${declaration}`);
      return content;
    }

    const { methodName } = parsed;

    // Check if there are existing definitions of this type
    if (this.hasExistingDefinitions(content, methodName)) {
      this.logger.warn(
        `Found existing ${methodName} definition. Removing it before adding the new one.`
      );
      content = this.removeExistingDefinition(content, declaration);
    }

    // Add the new definition
    const updatedContent = this.addDefinitionToContent(content, declaration);
    this.fileSystem.writeFileSync(configFilePath, updatedContent, 'utf8');

    this.logger.success(`Updated feature config: ${configFilePath}`);
    return updatedContent;
  }

  /**
   * Checks if there are any existing definitions of a specific type in the content.
   * @param content - The file content to search
   * @param methodName - The method name to check for (e.g., 'addJob', 'addApi')
   * @returns true if there are existing definitions of this type, false otherwise
   */
  private hasExistingDefinitions(content: string, methodName: string): boolean {
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.trim().startsWith(`.${methodName}(`)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Removes an existing definition from the content by finding the helper method call
   * and removing the entire method call block.
   * @param content - The file content
   * @param definition - The new definition to find the existing one from
   * @returns The content with the existing definition removed
   */
  private removeExistingDefinition(
    content: string,
    definition: string
  ): string {
    const parsed = parseHelperMethodDefinition(definition);

    if (!parsed) {
      return content;
    }

    const { methodName, firstParam } = parsed;
    let contentLines = content.split('\n');

    // Find and remove any existing definition
    let openingLineIndex = -1;

    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i];

      if (line.trim().startsWith(`.${methodName}(`)) {
        // Check if this is the right method call by comparing the first parameter
        if (firstParam && line.includes(firstParam)) {
          openingLineIndex = i;
          break;
        }
      }
    }

    if (openingLineIndex === -1) {
      return content;
    }

    // Find the closing parenthesis and semicolon
    let closingLineIndex = -1;
    let parenCount = 0;
    let foundOpening = false;

    for (let i = openingLineIndex; i < contentLines.length; i++) {
      const line = contentLines[i];

      for (const char of line) {
        if (char === '(') {
          parenCount++;
          foundOpening = true;
        } else if (char === ')') {
          parenCount--;
          if (foundOpening && parenCount === 0) {
            // Check if this line ends with semicolon
            if (line.trim().endsWith(';')) {
              closingLineIndex = i;
              break;
            }
          }
        }
      }

      if (closingLineIndex !== -1) {
        break;
      }
    }

    if (closingLineIndex === -1) {
      this.logger.warn(
        'Could not find closing parenthesis for existing definition'
      );
      return content;
    }

    // Remove the lines containing the existing definition
    contentLines.splice(
      openingLineIndex,
      closingLineIndex - openingLineIndex + 1
    );

    return contentLines.join('\n');
  }

  /**
   * Adds a definition to the content by finding the appropriate place to insert it.
   * @param content - The current file content
   * @param definition - The definition to add
   * @returns The updated content with the new definition
   */
  private addDefinitionToContent(content: string, definition: string): string {
    const lines = content.split('\n');
    const lastLineIndex = lines.length - 1;

    // Find the last line that's not empty and not a closing brace
    let insertIndex = lastLineIndex;
    for (let i = lastLineIndex; i >= 0; i--) {
      const line = lines[i].trim();
      if (line && !line.startsWith('}')) {
        insertIndex = i;
        break;
      }
    }

    // Insert the definition before the last closing brace
    lines.splice(insertIndex + 1, 0, `  ${definition}`);

    return lines.join('\n');
  }
}
