import {
  createProviders,
  type GeneratorConstructor,
} from '../generator/provider';
import type { Plugin } from './types';

/**
 * Creates a plugin with the given name and generator classes
 * @param name - Unique plugin name
 * @param generatorClasses - Generator class constructors to include in the plugin
 * @returns Plugin instance
 *
 * @example
 * ```typescript
 * export const wasp = createPlugin('wasp',
 *   ActionGenerator,
 *   ApiGenerator,
 *   CrudGenerator
 * );
 * ```
 */
export function createPlugin(
  name: string,
  ...generatorClasses: Array<GeneratorConstructor>
): Plugin {
  return {
    name,
    providers: createProviders(...generatorClasses),
  };
}
