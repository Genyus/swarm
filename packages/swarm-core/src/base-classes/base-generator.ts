import path from 'node:path';
import { SwarmGenerator, ValidationResult } from '../interfaces/generator';
import { IFileSystem } from '../types/filesystem';
import { Logger } from '../types/logger';
import { getFeatureImportPath } from '../utils/filesystem';
import { ExtendedSchema } from '../utils/schema-builder';
import { toCamelCase, toPascalCase } from '../utils/strings';
import { TemplateUtility } from '../utils/templates';

/**
 * Abstract base class for all generators
 */
export abstract class BaseGenerator<TArgs = any>
  implements SwarmGenerator<TArgs>
{
  abstract name: string;
  abstract description: string;
  abstract schema: ExtendedSchema;
  templates?: string[];
  protected templateUtility: TemplateUtility;
  protected path = path;

  constructor(
    protected fileSystem: IFileSystem,
    protected logger: Logger
  ) {
    this.templateUtility = new TemplateUtility(fileSystem);
  }

  /**
   * Generate code based on parameters
   * @param params Generation parameters
   * @returns Generation result
   */
  abstract generate(params: any): Promise<void> | void;

  /**
   * Validate parameters against the schema
   * @param params Parameters to validate
   * @returns Validation result
   */
  validate(params: any): ValidationResult {
    try {
      const validated = this.schema.parse(params);
      return { valid: true, data: validated };
    } catch (error) {
      return {
        valid: false,
        errors: this.formatValidationErrors(error),
      };
    }
  }

  /**
   * Generate help text from schema metadata
   * @returns Formatted help text
   */
  generateHelp(): string {
    const shape = (this.schema as any)._def?.shape;
    if (!shape) return this.description;

    let help = `${this.description}\n\n`;

    Object.keys(shape).forEach((fieldName) => {
      const fieldSchema = shape[fieldName];
      const metadata = fieldSchema._metadata;
      const isRequired = !fieldSchema._def?.typeName?.includes('Optional');
      const fieldType = this.getFieldType(fieldSchema);

      help += `  ${fieldName} (${fieldType})${isRequired ? ' (required)' : ' (optional)'}\n`;
      if (metadata) {
        help += `    ${metadata.description}\n`;
        if (metadata.examples) {
          help += `    Examples: ${metadata.examples.join(', ')}\n`;
        }
      }
      help += '\n';
    });

    return help;
  }

  private getFieldType(fieldSchema: any): string {
    const typeName = fieldSchema._def?.typeName;
    switch (typeName) {
      case 'ZodString':
        return 'string';
      case 'ZodNumber':
        return 'number';
      case 'ZodBoolean':
        return 'boolean';
      case 'ZodArray':
        return 'array';
      case 'ZodObject':
        return 'object';
      case 'ZodEnum':
        return 'enum';
      default:
        return 'unknown';
    }
  }

  /**
   * Processes a template and writes the result to a file
   */
  protected renderTemplateToFile(
    templateName: string,
    replacements: Record<string, any>,
    outputPath: string,
    readableFileType: string,
    force: boolean
  ): boolean {
    const templatePath = this.getTemplatePath(templateName);
    const fileExists = this.checkFileExists(
      outputPath,
      force,
      readableFileType
    );

    const content = this.templateUtility.processTemplate(
      templatePath,
      replacements
    );
    this.writeFile(outputPath, content, readableFileType, fileExists);

    return fileExists;
  }

  private formatValidationErrors(error: any): string[] {
    if (error.errors) {
      return error.errors.map((err: any) => {
        const fieldName = err.path?.join('.') || 'unknown';
        const message = err.message || 'Invalid value';
        return `${fieldName}: ${message}`;
      });
    }
    return [error.message || 'Validation failed'];
  }

  /**
   * String utility methods
   */
  protected toCamelCase(str: string): string {
    return toCamelCase(str);
  }

  protected toPascalCase(str: string): string {
    return toPascalCase(str);
  }

  protected getFeatureImportPath(featurePath: string): string {
    return getFeatureImportPath(featurePath);
  }

  /**
   * Checks if a file exists and handles force flag logic
   */
  protected checkFileExists(
    filePath: string,
    force: boolean,
    fileType: string
  ): boolean {
    const fileExists = this.fileSystem.existsSync(filePath);

    if (fileExists && !force) {
      this.logger.error(`${fileType} already exists: ${filePath}`);
      this.logger.error('Use --force to overwrite');
      throw new Error(`${fileType} already exists`);
    }

    return fileExists;
  }

  /**
   * Safely writes a file with proper error handling and logging
   */
  protected writeFile(
    filePath: string,
    content: string,
    fileType: string,
    fileExists: boolean
  ): void {
    this.fileSystem.writeFileSync(filePath, content);
    this.logger.success(
      `${fileExists ? 'Overwrote' : 'Generated'} ${fileType}: ${filePath}`
    );
  }

  /**
   * Standardized error handling wrapper for generator methods
   */
  protected async handleGeneratorError<T>(
    itemType: string,
    itemName: string,
    fn: () => Promise<T> | T
  ): Promise<T> {
    try {
      const result = await fn();

      this.logCompletion(itemType, itemName);

      return result;
    } catch (error: any) {
      this.logger.error(
        `Failed to generate ${itemType}: ${error?.stack || error}`
      );
      throw error;
    }
  }

  /**
   * Logs completion message for a generator
   */
  protected logCompletion(itemType: string, itemName: string): void {
    this.logger.success(`\n${itemType} ${itemName} processing complete.`);
  }

  /**
   * Gets the template path, relative to the generator
   * @param templateName - The name of the template file (e.g., 'api.eta')
   * @returns The full path to the template file
   */
  protected abstract getTemplatePath(templateName: string): string;
}
