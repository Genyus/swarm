import path from 'node:path';
import { FileSystem } from '../common';
import { Logger } from '../common/logger';
import {
  In,
  Out,
  SchemaFieldMetadata,
  SchemaManager,
  StandardSchemaV1,
  StandardValidationError,
  ValidationResult,
  standardValidate,
} from '../schema';
import { GeneratorServices } from './services';
import { Generator } from './types';

/**
 * Abstract base class for all generators
 */
export abstract class GeneratorBase<S extends StandardSchemaV1>
  implements Generator<S>
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
  async validate(params: In<S>): Promise<ValidationResult<Out<S>>> {
    try {
      const result = await standardValidate(this.schema, params);

      if (!result.issues) {
        return { valid: true, data: result.value };
      }

      return {
        valid: false,
        issues: result.issues,
        errors: result.issues.map((issue) => issue.message),
      };
    } catch (error: any) {
      if (error instanceof StandardValidationError) {
        return {
          valid: false,
          issues: error.issues,
          errors: error.issues.map((issue) => issue.message),
        };
      }

      return { valid: false, errors: [(error as Error).message] };
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

    Object.entries(shape).forEach(([fieldName, fieldSchema]) => {
      const metadata = SchemaManager.getCommandMetadata(fieldSchema);
      const isRequired = SchemaManager.isFieldRequired(fieldSchema);
      const fieldType = this.getFieldType(fieldSchema);
      const description = metadata?.description;

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

  private getFieldType(fieldSchema: SchemaFieldMetadata): string {
    return SchemaManager.getFieldTypeName(fieldSchema);
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
