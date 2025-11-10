import path from 'node:path';
import { core, ZodError, ZodType } from 'zod';
import { FileSystem } from '../common';
import { Logger } from '../common/logger';
import { In, Out, SchemaManager, ValidationResult } from '../schema';
import { GeneratorServices } from './services';
import { SwarmGenerator } from './types';

/**
 * Abstract base class for all generators
 */
export abstract class GeneratorBase<S extends ZodType>
  implements SwarmGenerator<S>
{
  abstract name: string;
  abstract description: string;
  abstract schema: S;
  protected path = path;

  constructor(protected services: GeneratorServices) {}

  protected get fileSystem(): FileSystem {
    return this.services.fileSystem;
  }

  protected get logger(): Logger {
    return this.services.logger;
  }

  /**
   * Generate code based on parameters
   * @param params Generation parameters
   * @returns Generation result
   */
  abstract generate(params: Out<S>): Promise<void>;

  /**
   * Validate parameters against the schema
   * @param params Parameters to validate
   * @returns Validation result
   */
  validate(params: In<S>): ValidationResult {
    try {
      const validated = this.schema.parse(params);
      return { valid: true, data: validated };
    } catch (error: any) {
      if (error instanceof ZodError) {
        return {
          valid: false,
          errors: this.formatValidationErrors(error),
        };
      }

      return {
        valid: false,
        errors: [(error as Error).message],
      };
    }
  }

  /**
   * Generate help text from schema metadata
   * @returns Formatted help text
   */
  generateHelp(): string {
    const shape = SchemaManager.getShape(this.schema);

    if (!shape) return this.description;

    let help = `${this.description}\n\n`;

    Object.keys(shape).forEach((fieldName) => {
      const fieldSchema = shape[fieldName] as ZodType;
      const metadata = SchemaManager.getCommandMetadata(fieldSchema);
      const isRequired = SchemaManager.isFieldRequired(fieldSchema);
      const fieldType = this.getFieldType(fieldSchema);
      const description = fieldSchema.meta()?.description;

      help += `  ${fieldName} (${fieldType})${isRequired ? ' (required)' : ' (optional)'}\n`;
      if (description) {
        help += `    ${description}\n`;
      }
      if (metadata?.examples) {
        help += `    Examples: ${metadata.examples.join(', ')}\n`;
      }
      help += '\n';
    });

    return help;
  }

  private getFieldType(fieldSchema: ZodType): string {
    const typeName = fieldSchema._zod.def.type;
    return SchemaManager.getFieldTypeName(fieldSchema);
  }

  private formatValidationErrors(error: ZodError): string[] {
    if (error.issues) {
      return error.issues.map((err: core.$ZodIssue) => {
        const fieldName = err.path.join('.') || 'unknown';
        const message = err.message;

        return `${fieldName}: ${message}`;
      });
    }

    return [error.message];
  }

  /**
   * Standardised error handling wrapper for generator methods
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
