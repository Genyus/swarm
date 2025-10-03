import { z } from 'zod';

/**
 * Common Zod schemas shared across CLI commands
 * These provide consistent validation rules for common command arguments
 */
export const commonSchemas = {
  feature: z.string().min(1, 'Feature is required'),
  name: z.string().min(1, 'Name is required'),
  path: z.string().min(1, 'Path is required'),
  entities: z.string().optional(),
  force: z.boolean().optional(),
  auth: z.boolean().optional(),
} satisfies Record<string, z.ZodTypeAny>;

/**
 * Creates a case-insensitive validation function for typed arrays
 * @param validValues - Array of valid type values
 * @returns A function that validates a comma-separated string as an array of typed values
 */
export const getTypedArrayValidator = <T extends string>(
  validValues: readonly T[]
) => {
  return (input: string | undefined): boolean => {
    if (!input) return true; // Optional field

    const values = input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const normalisedValues = validValues.map((value) => value.toLowerCase());

    // Check if all values are valid (case-insensitive)
    for (const value of values) {
      const normalisedValue = value.toLowerCase();
      if (!normalisedValues.includes(normalisedValue)) {
        return false;
      }
    }
    return true;
  };
};

/**
 * Creates a case-insensitive transformation function for typed arrays
 * @param validValues - Array of valid type values
 * @returns A function that transforms a comma-separated string to an array of typed values
 */
export const getTypedArrayTransformer = <T extends string>(
  validValues: readonly T[]
) => {
  return (input: string | undefined): T[] | undefined => {
    if (!input) return undefined;

    return input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((value) => {
        // Find the correctly cased version using case-insensitive matching
        const normalisedValue = value.toLowerCase();
        const validValue = validValues.find(
          (val) => val.toLowerCase() === normalisedValue
        );

        return validValue as T;
      });
  };
};

/**
 * Creates a case-insensitive validation function for single typed values
 * @param validValues - Array of valid type values
 * @returns A function that validates a string as an enum value
 */
export const getTypedValueValidator = <T extends string>(
  validValues: readonly T[]
) => {
  return (value: string): boolean => {
    const normalisedValue = value.toLowerCase();
    const normalisedValidOps = validValues.map((val) => val.toLowerCase());

    return normalisedValidOps.includes(normalisedValue);
  };
};

/**
 * Creates a case-insensitive transformation function for single typed values
 * @param validValues - Array of valid type values
 * @returns A function that transforms a string to a typed value
 */
export const getTypedValueTransformer = <T extends string>(
  validValues: readonly T[]
) => {
  return (value: string): T => {
    const normalisedValue = value.toLowerCase();
    const validValue = validValues.find(
      (val) => val.toLowerCase() === normalisedValue
    );

    return validValue as T;
  };
};
