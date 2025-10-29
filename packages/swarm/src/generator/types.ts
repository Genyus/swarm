import { ZodType } from 'zod';
import { Out } from '../schema';

/**
 * Base generator interface
 */
export interface Generator<S extends ZodType = ZodType> {
  /** Dynamically generate code from Zod schema */
  generate: (args: Out<S>) => Promise<void>;
  /** Unique generator name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Schema with metadata for validation and help generation */
  schema: S;
  /** Template names bundled with this generator */
  templates?: string[];
}
