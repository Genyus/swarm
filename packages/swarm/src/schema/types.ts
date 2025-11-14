import type { StandardSchemaV1 } from './standard';

export type In<S extends StandardSchemaV1> = StandardSchemaV1.InferInput<S>;
export type Out<S extends StandardSchemaV1> = StandardSchemaV1.InferOutput<S>;

export interface ValidationResult<T = unknown> {
  valid: boolean;
  data?: T;
  issues?: ReadonlyArray<StandardSchemaV1.Issue>;
  errors?: string[];
}
