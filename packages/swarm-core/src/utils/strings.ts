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
  if (
    name.endsWith('s') ||
    name.endsWith('sh') ||
    name.endsWith('ch') ||
    name.endsWith('x') ||
    name.endsWith('z')
  ) {
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
 * Splits the string into tokens using the following patterns:
 * - Separators: hyphen, underscore, space
 * - camelCase boundaries: any lower-case letter followed by an upper-case letter
 * @param str - The string to convert
 * @returns The PascalCase string
 */
export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+|(?<=[a-z])(?=[A-Z])/)
    .map((token) => {
      return token.length === 0
        ? token
        : token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
    })
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

/**
 * Checks if a helper method call exists in the content, handling multi-line definitions
 * and various formatting styles. This is more robust than simple string includes().
 *
 * @param content - The file content to search in
 * @param methodName - The helper method name (e.g., 'addApi', 'addRoute')
 * @param objectName - The name of the object being checked (e.g., 'getUsers', 'MainRoute')
 * @returns True if the method call with the object name exists
 *
 * @example
 * // Detects both single-line and multi-line definitions:
 * // .addApi('getUsers', ...)
 * // .addApi(
 * //   'getUsers',
 * //   ...
 * // )
 */
export function hasHelperMethodCall(
  content: string,
  methodName: string,
  objectName: string
): boolean {
  // Create a regex pattern that matches the method call with flexible whitespace
  // Pattern breakdown:
  // \. - literal dot
  // methodName - the method name
  // \s* - optional whitespace
  // \( - opening parenthesis
  // \s* - optional whitespace (including newlines)
  // ['"`] - quote character (single, double, or backtick)
  // [^,]+ - first parameter (featureName)
  // , - comma separator
  // \s* - optional whitespace
  // ['"`] - quote character (single, double, or backtick)
  // objectName - the object name (second parameter)
  // ['"`] - matching quote character
  const pattern = new RegExp(
    `\\.${methodName}\\s*\\(\\s*['"\`][^,]+['"\`]\\s*,\\s*['"\`]${objectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`,
    's' // 's' flag allows . to match newlines
  );

  return pattern.test(content);
}

/**
 * Extracts the method name and first parameter from a helper method definition.
 * This is used by the removeExistingDefinition method to identify what to remove.
 *
 * @param definition - The definition string to parse
 * @returns Object with methodName and firstParam, or null if parsing fails
 */
export function parseHelperMethodDefinition(definition: string): {
  methodName: string;
  firstParam: string;
} | null {
  const lines = definition.split('\n');
  const firstNonEmptyLine = lines.find((line) => line.trim() !== '');

  if (!firstNonEmptyLine) {
    return null;
  }

  // Extract the method name
  const methodMatch = firstNonEmptyLine.match(/\.(\w+)\s*\(/);
  if (!methodMatch) {
    return null;
  }

  const methodName = methodMatch[1];

  // Extract the second parameter (the actual item name) - check the first line first, then subsequent lines
  let secondParamMatch = firstNonEmptyLine.match(
    /\(\s*[^,]+,\s*['"`]([^'"`]+)['"`]\s*,/
  );

  if (!secondParamMatch) {
    // Look for the second parameter in subsequent lines (multi-line case)
    const remainingLines = lines.slice(lines.indexOf(firstNonEmptyLine) + 1);
    for (const line of remainingLines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        secondParamMatch = trimmedLine.match(/['"`]([^'"`]+)['"`]/);
        if (secondParamMatch) {
          break;
        }
      }
    }
  }

  if (!secondParamMatch) {
    return null;
  }

  return {
    methodName,
    firstParam: secondParamMatch[1],
  };
}
