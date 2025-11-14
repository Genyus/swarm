import type { StandardSchemaV1 } from '@standard-schema/spec';

export type { StandardSchemaV1 } from '@standard-schema/spec';

type StandardSchemaResult<T extends StandardSchemaV1> = StandardSchemaV1.Result<
  StandardSchemaV1.InferOutput<T>
>;

export function isStandardSchema(value: unknown): value is StandardSchemaV1 {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as any)['~standard'] === 'object' &&
    typeof (value as any)['~standard'].validate === 'function'
  );
}

export async function standardValidate<T extends StandardSchemaV1>(
  schema: T,
  input: StandardSchemaV1.InferInput<T>
): Promise<StandardSchemaResult<T>> {
  const rawResult = schema['~standard'].validate(input);

  return rawResult instanceof Promise ? await rawResult : rawResult;
}

export class StandardValidationError extends Error {
  constructor(public readonly issues: ReadonlyArray<StandardSchemaV1.Issue>) {
    super(
      issues
        .map((issue) => {
          const path =
            issue.path && issue.path.length > 0
              ? ` (${issue.path
                  .map((segment) =>
                    typeof segment === 'object' && 'key' in segment
                      ? String(segment.key)
                      : String(segment)
                  )
                  .join('.')})`
              : '';
          return `${issue.message}${path}`;
        })
        .join('\n')
    );
  }
}
