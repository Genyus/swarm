import { ZodType } from 'zod';
import { Out } from '../schema';

/**
 * Swarm generator interface
 * @template S - Zod schema type
 */
export interface SwarmGenerator<S extends ZodType = ZodType> {
  /** Dynamically generate code from a schema-validated object */
  generate: (args: Out<S>) => Promise<void>;
  /** Unique generator name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Zod schema for parameter validation and code generation */
  schema: S;
  /** Template names bundled with this generator */
  templates?: string[];
}
