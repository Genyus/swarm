import { extend } from '@ingenyus/swarm-core';
import { z } from 'zod';

/**
 * Common Zod schemas shared across Wasp generators
 * These provide consistent validation rules for common generator arguments
 */
export const commonSchemas = {
  feature: extend(z.string().min(1, 'Feature is required'), {
    description: 'The feature directory this resource will be generated in',
    friendlyName: 'Feature',
    shortName: 'f',
    examples: ['root', 'auth', 'dashboard/users'],
    helpText:
      'Can be nested as a logical or relative path, e.g. "dashboard/users" or "features/dashboard/features/users"',
  }),
  name: extend(z.string().min(1, 'Name is required'), {
    description: 'The name of the generated resource',
    friendlyName: 'Name',
    shortName: 'n',
    examples: ['users', 'task'],
    helpText: 'Will be used for generated files and configuration entries',
  }),
  path: extend(z.string().min(1, 'Path is required'), {
    description: 'The path that this resource will be accessible at',
    friendlyName: 'Path',
    shortName: 'p',
    examples: ['/api/users/:id', '/api/products'],
    helpText: 'Supports Express-style placeholders, e.g. "/api/users/:id"',
  }),
  entities: extend(z.string().optional(), {
    description:
      'The Wasp entities that this resource will have access to (optional)',
    friendlyName: 'Entities',
    shortName: 'e',
    examples: ['User,Product'],
    helpText: 'A comma-separated list of Wasp entities',
  }),
  force: extend(z.boolean().optional(), {
    description:
      'Force overwrite of existing files and configuration entries (optional)',
    friendlyName: 'Force',
    shortName: 'F',
    helpText:
      'CAUTION: Will overwrite existing files and configuration entries with current parameters',
  }),
  auth: extend(z.boolean().optional(), {
    description: 'Require authentication for this resource (optional)',
    friendlyName: 'Auth',
    shortName: 'a',
    helpText: 'Will generate authentication checks',
  }),
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
