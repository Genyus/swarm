import type { StandardSchemaV1 } from '../schema';
import { Out } from '../schema';

export type GeneratorEnvironment = 'cli' | 'mcp' | 'test';

/**
 * Generator interface
 * @template S - Standard Schema definition
 */
export interface Generator<S extends StandardSchemaV1 = StandardSchemaV1> {
  /** Unique generator name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Standard Schema definition for parameter validation and code generation */
  schema: S;
  /** Dynamically generate code from a schema-validated object */
  generate: (args: Out<S>) => Promise<void>;
}
