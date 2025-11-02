import { ZodType } from 'zod';
import { Out } from '../schema';

/**
 * Swarm generator interface
 * @template S - Zod schema type
 */
export interface SwarmGenerator<S extends ZodType = ZodType> {
  /** Unique generator name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Zod schema for parameter validation and code generation */
  schema: S;
  /** Dynamically generate code from a schema-validated object */
  generate: (args: Out<S>) => Promise<void>;
}
