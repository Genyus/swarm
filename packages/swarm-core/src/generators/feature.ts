import path from 'node:path';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import { handleFatalError } from '../utils/errors';
import {
  copyDirectory,
  findWaspRoot,
  getFeatureDir,
  getTemplatesDir,
} from '../utils/filesystem';
import {
  parseHelperMethodDefinition,
  validateFeaturePath,
} from '../utils/strings';
import { TemplateUtility } from '../utils/templates';

export class FeatureGenerator implements IFeatureGenerator {
  private templateUtility: TemplateUtility;

  constructor(
    private logger: Logger,
    private fs: IFileSystem
  ) {
    this.templateUtility = new TemplateUtility(fs);
    this.logger = logger;
    this.fs = fs;
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
    // Use the utility function to parse the definition
    const parsed = parseHelperMethodDefinition(definition);
    if (!parsed) {
      return content;
    }

    const { methodName, firstParam } = parsed;

    let contentLines = content.split('\n');
    let hasRemoved = true;

    while (hasRemoved) {
      hasRemoved = false;

      let openingLineIndex = -1;
      for (let i = 0; i < contentLines.length; i++) {
        const line = contentLines[i];
        if (line.includes(`.${methodName}(`)) {
          let searchContent = line;
          let j = i;
          while (j < contentLines.length && j < i + 5) {
            searchContent = contentLines.slice(i, j + 1).join('\n');
            const singleQuoteMatch = new RegExp(
              `['"]${firstParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`
            );
            const backtickMatch = new RegExp(
              `\`${firstParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\``
            );

            if (
              singleQuoteMatch.test(searchContent) ||
              backtickMatch.test(searchContent)
            ) {
              openingLineIndex = i;
              break;
            }
            j++;
          }
          if (openingLineIndex !== -1) break;
        }
      }

      if (openingLineIndex === -1) {
        break;
      }

      let closingLineIndex = -1;
      let parenCount = 0;
      let foundOpeningParen = false;

      for (let i = openingLineIndex; i < contentLines.length; i++) {
        const line = contentLines[i];

        for (const char of line) {
          if (char === '(') {
            parenCount++;
            foundOpeningParen = true;
          } else if (char === ')') {
            parenCount--;
            if (foundOpeningParen && parenCount === 0) {
              closingLineIndex = i;
              break;
            }
          }
        }

        if (closingLineIndex !== -1) {
          break;
        }
      }

      if (closingLineIndex === -1) {
        break;
      }

      contentLines = [
        ...contentLines.slice(0, openingLineIndex),
        ...contentLines.slice(closingLineIndex + 1),
      ];

      hasRemoved = true;
    }

    return contentLines.join('\n');
  }

  /**
   * Updates or creates a feature configuration file with a pre-built definition.
   * @param featurePath - The path of the feature
   * @param definition - The pre-built definition string to add
   * @returns The path of the configuration file
   */
  public updateFeatureConfig(featurePath: string, definition: string): string {
    const configFilePrefix = featurePath.split('/').join('.');
    const configDir = getFeatureDir(this.fs, featurePath);
    const configFilePath = path.join(configDir, `${configFilePrefix}.wasp.ts`);

    if (!this.fs.existsSync(configFilePath)) {
      const templatesDir = getTemplatesDir(this.fs);
      const templatePath = path.join(templatesDir, 'config', 'feature.wasp.ts');
      if (!this.fs.existsSync(templatePath)) {
        handleFatalError(`Feature config template not found: ${templatePath}`);
      }
      this.fs.copyFileSync(templatePath, configFilePath);
    }

    let content = this.fs.readFileSync(configFilePath, 'utf8');

    // Remove existing definition before adding new one
    content = this.removeExistingDefinition(content, definition);

    // Find the position to insert the new definition
    const lines = content.split('\n');
    const configureFunctionStart = lines.findIndex((line) =>
      line.trim().startsWith('export default function')
    );

    if (configureFunctionStart === -1) {
      handleFatalError('Could not find configure function in feature config');
    }

    // Find the app line inside the configure function
    const appLineIndex = lines.findIndex(
      (line, index) => index > configureFunctionStart && line.trim() === 'app'
    );

    if (appLineIndex === -1) {
      // No existing app chain, add it after the opening brace
      const insertIndex = configureFunctionStart + 1;
      lines.splice(insertIndex, 0, '  app', definition);
    } else {
      // Insert after the existing app line
      lines.splice(appLineIndex + 1, 0, definition);
    }

    this.fs.writeFileSync(configFilePath, lines.join('\n'));

    return configFilePath;
  }

  public generateFeatureConfig(featureName: string): void {
    // Create feature directory if it doesn't exist
    const featureDir = getFeatureDir(this.fs, featureName);
    if (!this.fs.existsSync(featureDir)) {
      this.fs.mkdirSync(featureDir, { recursive: true });
    }

    // Generate feature config in the feature directory
    const templatesDir = getTemplatesDir(this.fs);
    const templatePath = path.join(templatesDir, 'config', 'feature.wasp.ts');

    if (!this.fs.existsSync(templatePath)) {
      this.logger.error(`Template not found: ${templatePath}`);
      return;
    }

    const featureKey = featureName.replace(/[^a-zA-Z0-9]/g, '');
    const content = this.fs
      .readFileSync(templatePath, 'utf8')
      .replace(/\$\{FEATURE_NAME\}/g, featureName)
      .replace(/\$\{FEATURE_KEY\}/g, featureKey);

    // Place config file in feature directory: features/{featureName}/{featureName}.wasp.ts
    const outputPath = path.join(featureDir, `${featureName}.wasp.ts`);

    this.fs.writeFileSync(outputPath, content);
    this.logger.success(`Generated feature config: ${outputPath}`);
  }

  public generateFeature(featurePath: string): void {
    const segments = validateFeaturePath(featurePath);
    if (segments.length > 1) {
      const parentPath = segments.slice(0, -1).join('/');

      if (!this.fs.existsSync(parentPath)) {
        handleFatalError(
          `Parent feature '${parentPath}' does not exist. Please create it first.`
        );
        handleFatalError('Parent feature does not exist');
      }
    }

    const templateDir = path.join(
      getTemplatesDir(this.fs),
      'feature',
      segments.length === 1 ? '' : '_core'
    );
    const featureDir = path.join(
      findWaspRoot(this.fs, featurePath),
      'src',
      'features',
      featurePath
    );

    copyDirectory(this.fs, templateDir, featureDir);
    this.logger.debug(`Copied template from ${templateDir} to ${featureDir}`);

    if (segments.length === 1) {
      this.generateFeatureConfig(featurePath);
    }

    this.logger.success(
      `Generated ${
        segments.length === 1 ? 'top-level ' : 'sub-'
      }feature: ${featurePath}`
    );
  }
}
