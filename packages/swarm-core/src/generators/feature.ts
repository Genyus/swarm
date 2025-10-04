import * as realFileSystem from 'node:fs';
import path from 'node:path';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import { SwarmLogger } from '../utils';
import { handleFatalError } from '../utils/errors';
import {
  copyDirectory,
  findWaspRoot,
  getFeatureDir,
  getTemplatesDir,
  normaliseFeaturePath,
} from '../utils/filesystem';
import {
  parseHelperMethodDefinition,
  validateFeaturePath,
} from '../utils/strings';

export class FeatureGenerator implements IFeatureGenerator {
  constructor(
    private logger: Logger = new SwarmLogger(),
    private fs: IFileSystem = realFileSystem
  ) {}

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

      if (line.includes(`.${methodName}(`)) {
        // Look for the method call with the specific name parameter (second parameter)
        // We only need to check the first line since the name parameter is always on the same line as the method call
        const singleQuoteMatch = new RegExp(
          `\\.${methodName}\\s*\\([^,]+,\\s*['"]${firstParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`
        );
        const backtickMatch = new RegExp(
          `\\.${methodName}\\s*\\([^,]+,\\s*\`${firstParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\``
        );

        if (singleQuoteMatch.test(line) || backtickMatch.test(line)) {
          openingLineIndex = i;
          break;
        }
      }
    }

    if (openingLineIndex === -1) {
      return content; // No matching definition found
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
      return content; // Could not find closing parenthesis
    }

    // Check if this is the only definition of its type
    let isOnlyDefinition = true;

    for (let i = 0; i < contentLines.length; i++) {
      if (
        i !== openingLineIndex &&
        contentLines[i].trim().startsWith(`.${methodName}(`)
      ) {
        isOnlyDefinition = false;

        break;
      }
    }

    // If this is the only definition, also remove the comment before it
    let commentLineIndex = -1;

    if (isOnlyDefinition) {
      for (let i = openingLineIndex - 1; i >= 0; i--) {
        const line = contentLines[i].trim();

        if (line.startsWith('//') && line.includes('definitions')) {
          commentLineIndex = i;

          break;
        } else if (line === '' || line.startsWith('.')) {
          // Skip empty lines and method calls
          continue;
        } else {
          // Stop at non-comment, non-empty, non-method lines
          break;
        }
      }
    }

    // Remove the existing definition and its comment if found
    const startIndex =
      commentLineIndex !== -1 ? commentLineIndex : openingLineIndex;

    contentLines = [
      ...contentLines.slice(0, startIndex),
      ...contentLines.slice(closingLineIndex + 1),
    ];

    return contentLines.join('\n');
  }

  /**
   * Determines the insertion index for a method name based on alphabetical ordering
   * of existing groups in the configuration file.
   * @param groups - Object containing existing method groups
   * @param methodName - The method name to find insertion index for
   * @returns The insertion index for the method name
   */
  private getInsertionIndexForMethod(
    groups: Record<string, any[]>,
    methodName: string
  ): number {
    const existingMethods = Object.keys(groups).filter(
      (method) => groups[method].length > 0
    );
    const allMethods = [...existingMethods, methodName].sort();

    return allMethods.indexOf(methodName);
  }

  /**
   * Gets the comment text for a method type.
   * @param methodName The method name (e.g., 'addApi')
   * @returns The comment text for the method type
   */
  private getMethodComment(methodName: string): string {
    const entityName = methodName.startsWith('add')
      ? methodName.slice(3)
      : methodName;

    return `// ${entityName} definitions`;
  }

  /**
   * Finds the correct insertion point for a new configuration item.
   * @param lines - Array of file lines
   * @param methodName - The method name (e.g., 'addApi')
   * @param definition - The definition string to parse for item name
   * @returns Object with insertion index and whether to add a comment
   */
  private findGroupInsertionPoint(
    lines: string[],
    methodName: string,
    definition: string,
    hasExistingDefinitionsOfType: boolean
  ): { insertIndex: number; addComment: boolean } {
    const appLineIndex = lines.findIndex((line) => line.trim() === 'app');

    if (appLineIndex === -1) {
      return { insertIndex: appLineIndex + 1, addComment: false }; // Insert after app line
    }

    // Find all existing method calls and their positions
    const methodCalls: Array<{
      lineIndex: number;
      endLineIndex: number;
      methodName: string;
      itemName: string;
    }> = [];

    for (let i = appLineIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('.') && line.includes('(')) {
        // Look for the method call across multiple lines
        let methodCallContent = line;
        let j = i;
        let closingParenCount = 0;
        let foundClosingParen = false;

        // Count opening and closing parentheses to find the complete method call
        for (let k = 0; k < methodCallContent.length; k++) {
          if (methodCallContent[k] === '(') closingParenCount++;
          if (methodCallContent[k] === ')') closingParenCount--;
          if (closingParenCount === 0 && methodCallContent[k] === ')') {
            foundClosingParen = true;
            break;
          }
        }

        // If not found on this line, look at subsequent lines
        while (!foundClosingParen && j < lines.length - 1) {
          j++;
          methodCallContent += ' ' + lines[j].trim();
          for (let k = 0; k < lines[j].length; k++) {
            if (lines[j][k] === '(') closingParenCount++;
            if (lines[j][k] === ')') closingParenCount--;
            if (closingParenCount === 0 && lines[j][k] === ')') {
              foundClosingParen = true;
              break;
            }
          }
        }

        const match = methodCallContent.match(
          /\.(\w+)\([^,]+,\s*['"`]([^'"`]+)['"`]/
        );
        if (match) {
          methodCalls.push({
            lineIndex: i,
            endLineIndex: j,
            methodName: match[1],
            itemName: match[2],
          });
        }
      }
    }

    // Group method calls by type
    const groups: Record<
      string,
      Array<{ lineIndex: number; endLineIndex: number; itemName: string }>
    > = {};
    methodCalls.forEach((call) => {
      if (!groups[call.methodName]) {
        groups[call.methodName] = [];
      }
      groups[call.methodName].push({
        lineIndex: call.lineIndex,
        endLineIndex: call.endLineIndex,
        itemName: call.itemName,
      });
    });

    // Find the target group
    const targetGroup = groups[methodName] || [];

    if (targetGroup.length === 0) {
      // No items of this type exist, find position based on alphabetical ordering
      const targetGroupIndex = this.getInsertionIndexForMethod(
        groups,
        methodName
      );
      const existingMethods = Object.keys(groups)
        .filter((method) => groups[method].length > 0)
        .sort();

      // Look for the first group that comes after the target group alphabetically
      for (let i = targetGroupIndex; i < existingMethods.length; i++) {
        const groupMethod = existingMethods[i];
        if (groups[groupMethod] && groups[groupMethod].length > 0) {
          // Insert before the first item of the next group
          const firstItem = groups[groupMethod][0];
          let insertIndex = firstItem.lineIndex;

          // Check if there's a comment line before the first item
          for (let j = firstItem.lineIndex - 1; j > appLineIndex; j--) {
            const line = lines[j].trim();
            if (line.startsWith('//') && line.includes('definitions')) {
              insertIndex = j; // Insert before the comment
              break;
            } else if (line.startsWith('.') || line === '') {
              // Skip empty lines and method calls
              continue;
            } else {
              // Stop at non-comment, non-empty, non-method lines
              break;
            }
          }

          // Only add comment if this is the first item of its type
          return { insertIndex, addComment: !hasExistingDefinitionsOfType };
        }
      }

      // If no later groups exist, look for the last item of the previous group
      for (let i = targetGroupIndex - 1; i >= 0; i--) {
        const groupMethod = existingMethods[i];

        if (groups[groupMethod] && groups[groupMethod].length > 0) {
          const lastItem = groups[groupMethod][groups[groupMethod].length - 1];

          return {
            insertIndex: lastItem.endLineIndex + 1,
            addComment: !hasExistingDefinitionsOfType,
          };
        }
      }

      return {
        insertIndex: appLineIndex + 1,
        addComment: !hasExistingDefinitionsOfType,
      }; // Insert after app line if no groups exist
    }

    // Parse the new item name
    const parsed = parseHelperMethodDefinition(definition);

    if (!parsed) {
      return { insertIndex: appLineIndex + 1, addComment: false }; // Fallback if parsing fails
    }

    const { firstParam: itemName } = parsed;

    // Find the correct insertion point by comparing with existing items
    // We need to find where this item should be inserted alphabetically
    for (let i = 0; i < targetGroup.length; i++) {
      if (itemName.localeCompare(targetGroup[i].itemName) < 0) {
        // Insert before this item
        // If we're inserting at the beginning of the group, we need to add the comment
        return { insertIndex: targetGroup[i].lineIndex, addComment: false };
      }
    }

    // If we get here, the new item should be inserted after the last item
    const lastItem = targetGroup[targetGroup.length - 1];

    return { insertIndex: lastItem.endLineIndex + 1, addComment: false };
  }

  /**
   * Inserts a definition with optional comment header.
   * @param lines - Array of file lines
   * @param definition - The definition to insert
   * @param insertIndex - The index where to insert
   * @param methodName - The method name for comment generation
   * @param addComment - Whether to add a comment before the definition
   * @returns The modified lines array
   */
  private insertWithSpacing(
    lines: string[],
    definition: string,
    insertIndex: number,
    methodName: string,
    addComment: boolean = false
  ): string[] {
    const newLines = [...lines];

    // Add comment if this is the first item of its type
    if (addComment) {
      const comment = this.getMethodComment(methodName);

      newLines.splice(insertIndex, 0, `    ${comment}`);
      insertIndex += 1; // Adjust for the added comment line
    }

    // Insert the definition (trim any trailing newlines)
    newLines.splice(insertIndex, 0, definition.trimEnd());

    return newLines;
  }

  /**
   * Updates or creates a feature configuration file with a pre-built definition.
   * @param featurePath - The path of the feature
   * @param definition - The pre-built definition string to add
   * @returns The path of the configuration file
   */
  public updateFeatureConfig(featurePath: string, definition: string): string {
    const configFilePrefix = featurePath.split('/').at(-1)!;
    const configDir = getFeatureDir(this.fs, featurePath);
    const configFilePath = path.join(configDir, `${configFilePrefix}.wasp.ts`);

    if (!this.fs.existsSync(configFilePath)) {
      const templatesDir = getTemplatesDir(this.fs);
      const templatePath = path.join(
        templatesDir,
        'config',
        'feature.wasp.eta'
      );

      if (!this.fs.existsSync(templatePath)) {
        handleFatalError(`Feature config template not found: ${templatePath}`);
      }

      this.fs.copyFileSync(templatePath, configFilePath);
    }

    let content = this.fs.readFileSync(configFilePath, 'utf8');
    const parsed = parseHelperMethodDefinition(definition);

    if (!parsed) {
      handleFatalError(`Could not parse definition: ${definition}`);
      return content;
    }

    const { methodName } = parsed;

    // Remove existing definition before adding new one
    content = this.removeExistingDefinition(content, definition);

    // Check if there are any existing definitions of this type after removal
    const hasExistingDefinitions = this.hasExistingDefinitions(
      content,
      methodName
    );

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
      const itemsToInsert = ['  app'];

      // Always add comment for the first entry since it's the first item of its type
      const comment = this.getMethodComment(methodName);
      itemsToInsert.push(`    ${comment}`);

      itemsToInsert.push(definition.trimEnd());
      lines.splice(insertIndex, 0, ...itemsToInsert);
    } else {
      // Find the correct insertion point based on ordering
      const { insertIndex, addComment } = this.findGroupInsertionPoint(
        lines,
        methodName,
        definition,
        hasExistingDefinitions
      );

      // Insert with proper spacing
      const newLines = this.insertWithSpacing(
        lines,
        definition,
        insertIndex,
        methodName,
        addComment
      );
      this.fs.writeFileSync(configFilePath, newLines.join('\n'));
      return configFilePath;
    }

    this.fs.writeFileSync(configFilePath, lines.join('\n'));

    return configFilePath;
  }

  public generateFeatureConfig(normalisedPath: string): void {
    // Extract the actual feature name from the normalized path
    // e.g., "features/demo" -> "demo", "features/demo/features/sub-feature" -> "sub-feature"
    const segments = normalisedPath.split('/');
    const featureName = segments[segments.length - 1];

    // Create feature directory if it doesn't exist
    const featureDir = getFeatureDir(this.fs, normalisedPath);
    if (!this.fs.existsSync(featureDir)) {
      this.fs.mkdirSync(featureDir, { recursive: true });
    }

    // Generate feature config in the feature directory
    const templatesDir = getTemplatesDir(this.fs);
    const templatePath = path.join(templatesDir, 'files', 'feature.wasp.eta');

    if (!this.fs.existsSync(templatePath)) {
      this.logger.error(`Template not found: ${templatePath}`);
      return;
    }

    const featureKey = featureName.replace(/[^a-zA-Z0-9]/g, '');
    const content = this.fs
      .readFileSync(templatePath, 'utf8')
      .replace(/\$\{FEATURE_NAME\}/g, featureName)
      .replace(/\$\{FEATURE_KEY\}/g, featureKey);

    // Place config file in feature directory: {normalisedPath}/{featureName}.wasp.ts
    const outputPath = path.join(featureDir, `${featureName}.wasp.ts`);

    this.fs.writeFileSync(outputPath, content);
    this.logger.success(`Generated feature config: ${outputPath}`);
  }

  public generateFeature(featurePath: string): void {
    const segments = validateFeaturePath(featurePath);
    const normalisedPath = normaliseFeaturePath(featurePath);
    const sourceRoot = path.join(findWaspRoot(this.fs), 'src');

    if (segments.length > 1) {
      const parentPath = segments.slice(0, -1).join('/');
      const parentNormalisedPath = normaliseFeaturePath(parentPath);
      const parentFeatureDir = path.join(sourceRoot, parentNormalisedPath);

      if (!this.fs.existsSync(parentFeatureDir)) {
        handleFatalError(
          `Parent feature '${parentPath}' does not exist. Please create it first.`
        );
      }
    }

    const templateDir = path.join(getTemplatesDir(this.fs), 'feature');
    const featureDir = path.join(sourceRoot, normalisedPath);

    copyDirectory(this.fs, templateDir, featureDir);
    this.logger.debug(`Copied template from ${templateDir} to ${featureDir}`);
    this.generateFeatureConfig(normalisedPath);
    this.logger.success(`Generated feature: ${normalisedPath}`);
  }
}
