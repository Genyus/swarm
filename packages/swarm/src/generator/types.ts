import z from 'zod';
import { ExtendedSchema } from '../schema';

export type GeneratorArgs = z.infer<ExtendedSchema>;

/**
 * Base generator interface
 */
export interface Generator<TArgs extends GeneratorArgs> {
  /** Dynamically generate code from Zod schema */
  generate: (args: TArgs) => Promise<void> | void;
}

/**
 * Plugin generator interface
 */
export interface PluginGenerator<TArgs extends GeneratorArgs>
  extends Generator<TArgs> {
  /** Unique generator name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Schema with metadata for validation and help generation */
  schema: ExtendedSchema;
  /** Template names bundled with this generator */
  templates?: string[];
}
