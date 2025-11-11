import { ZodType } from 'zod';
import { Out } from '../schema';

export type GeneratorEnvironment = 'cli' | 'mcp' | 'test';

/**
 * Generator interface
 * @template S - Zod schema type
 */
export interface Generator<S extends ZodType = ZodType> {
  /** Unique generator name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Zod schema for parameter validation and code generation */
  schema: S;
  /** Dynamically generate code from a schema-validated object */
  generate: (args: Out<S>) => Promise<void>;
}
