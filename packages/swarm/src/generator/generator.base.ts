import path from 'node:path';
import { ExtendedSchema } from '../common';
import { SwarmGenerator, ValidationResult } from '../contracts';
import { FileSystem } from '../types/filesystem';
import { Logger } from '../types/logger';

/**
 * Abstract base class for all generators
 */
export abstract class GeneratorBase<TArgs = any>
  implements SwarmGenerator<TArgs>
{
  abstract name: string;
  abstract description: string;
  abstract schema: ExtendedSchema;
  templates?: string[];
  protected path = path;

  constructor(
    protected fileSystem: FileSystem,
    protected logger: Logger
  ) {}

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
        `Generating ${itemName} ${itemType.toLowerCase()} failed.`
      );
      throw error;
    }
  }

  /**
   * Logs completion message for a generator
   */
  protected logCompletion(itemType: string, itemName: string): void {
    this.logger.success(
      `Generating ${itemName} ${itemType.toLowerCase()} completed.`
    );
  }
}
