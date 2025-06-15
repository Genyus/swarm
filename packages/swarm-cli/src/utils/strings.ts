// Utility functions for string manipulation and validation

/**
 * Maps singular operation types to their plural directory names.
 */
export const OPERATION_DIRECTORIES: Record<string, string> = {
  query: 'queries',
  action: 'actions',
};

/**
 * Formats a component name for display by removing the 'Page' suffix and adding spaces between words.
 * @param componentName - The name of the component (e.g., 'ContactPage', 'AboutUsPage')
 * @returns The formatted display name (e.g., 'Contact', 'About Us')
 */
export function formatDisplayName(componentName: string): string {
  const nameWithoutSuffix = componentName.replace(/Page$/, '');
  return nameWithoutSuffix
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
}

/**
 * Gets the plural form of a word.
 * @param name - The word to pluralize
 * @returns The pluralized word
 */
export function getPlural(name: string): string {
  if (name.endsWith('y')) {
    return `${name.slice(0, -1)}ies`;
  }
  if (name.endsWith('s')) {
    return `${name}es`;
  }
  return `${name}s`;
}

/**
 * Checks if a string is in kebab-case format.
 * @param str - The string to check
 * @returns True if the string is in kebab-case
 */
export function isKebabCase(str: string): boolean {
  return /^[a-z]+(?:-[a-z]+)*$/.test(str);
}

/**
 * Parses command line arguments into a flags object.
 * @param args - Command line arguments to parse
 * @returns Object containing parsed flags and their values
 */
export function parseFlags(args: string[]): Record<string, string | boolean> {
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const flag = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        flags[flag] = value;
        i++;
      } else {
        flags[flag] = true;
      }
    }
  }
  return flags;
}

/**
 * Converts a string to camelCase.
 * @param str - The string to convert
 * @returns The camelCase string
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts a string to kebab-case.
 * @param str - The string to convert
 * @returns The kebab-case string
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to PascalCase.
 * @param str - The string to convert
 * @returns The PascalCase string
 */
export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Validates that a feature name is in kebab-case format.
 * @param name - The feature name to validate
 * @throws If the name is not in kebab-case format
 */
export function validateFeatureName(name: string): void {
  if (!isKebabCase(name)) {
    throw new Error(
      `Feature name must be in kebab-case format. Received: ${name}`
    );
  }
}

/**
 * Validates a feature path and returns its segments.
 * @param featurePath - The path of features (e.g., "parent/child/grandchild")
 * @returns Array of validated feature names
 * @throws If any path segment is invalid
 */
export function validateFeaturePath(featurePath: string): string[] {
  const segments = featurePath.split('/').filter(Boolean);
  if (segments.length === 0) {
    throw new Error('Feature path cannot be empty');
  }
  segments.forEach((segment) => {
    validateFeatureName(segment);
  });
  return segments;
}

/**
 * Validates that a file type is supported.
 * @param type - The file type to validate
 * @throws If the type is not supported
 */
export function validateFileType(type: string): void {
  const validTypes = [
    'component',
    'hook',
    'layout',
    'route',
    'util',
    'action',
    'endpoint',
    'middleware',
    'query',
    'type',
  ];
  if (!validTypes.includes(type)) {
    throw new Error(
      `Invalid file type. Must be one of: ${validTypes.join(', ')}`
    );
  }
}

/**
 * Validates that a route path is properly formatted.
 * @param path - The route path to validate
 * @throws If the path is invalid
 */
export function validateRoutePath(path: string): void {
  if (!path.startsWith('/')) {
    throw new Error('Route path must start with a forward slash');
  }
  const invalidPatterns = /[^a-zA-Z0-9\-_/:.]/g;
  if (invalidPatterns.test(path)) {
    throw new Error('Route path contains invalid characters');
  }
}

/**
 * Capitalises only the first letter of a string, leaving the rest unchanged.
 * @param str - The string to capitalise
 * @returns The capitalised string
 */
export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
