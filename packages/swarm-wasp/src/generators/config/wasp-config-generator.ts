import {
  FileSystem,
  handleFatalError,
  Logger,
  parseHelperMethodDefinition,
  SignaleLogger,
} from '@ingenyus/swarm';
import path from 'node:path';
import { getFeatureDir, realFileSystem, TemplateUtility } from '../../common';
import { ConfigGenerator } from '../../generators/config';

export class WaspConfigGenerator implements ConfigGenerator {
  protected path = path;
  protected templateUtility: TemplateUtility;

  constructor(
    protected logger: Logger = new SignaleLogger(),
    protected fileSystem: FileSystem = realFileSystem
  ) {
    this.templateUtility = new TemplateUtility(fileSystem);
  }

  /**
   * Gets the template path for feature config templates.
   * Feature config templates are located in the feature-directory generator's templates directory.
   * @param templateName - The name of the template file (e.g., 'feature.wasp.eta')
   * @returns The full path to the template file
   */
  private getTemplatePath(templateName: string): string {
    return this.templateUtility.resolveTemplatePath(
      templateName,
      'feature-directory',
      import.meta.url
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

    // Remove existing definition before adding new one
    content = this.removeExistingDefinition(content, declaration);

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

      itemsToInsert.push(declaration.trimEnd());
      lines.splice(insertIndex, 0, ...itemsToInsert);
    } else {
      // Find the correct insertion point based on ordering
      const { insertIndex, addComment } = this.findGroupInsertionPoint(
        lines,
        methodName,
        declaration,
        hasExistingDefinitions
      );

      // Insert with proper spacing
      const newLines = this.insertWithSpacing(
        lines,
        declaration,
        insertIndex,
        methodName,
        addComment
      );
      this.fileSystem.writeFileSync(configFilePath, newLines.join('\n'));
      return configFilePath;
    }

    this.fileSystem.writeFileSync(configFilePath, lines.join('\n'));

    return configFilePath;
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
   * @param declaration - The declaration to insert
   * @param insertIndex - The index where to insert
   * @param methodName - The method name for comment generation
   * @param addComment - Whether to add a comment before the declaration
   * @returns The modified lines array
   */
  private insertWithSpacing(
    lines: string[],
    declaration: string,
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

    // Insert the declaration (trim any trailing newlines)
    newLines.splice(insertIndex, 0, declaration.trimEnd());

    return newLines;
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
