import { GeneratorProvider } from '../generator/provider';

/**
 * Plugin interface
 */
export interface Plugin {
  /** Unique plugin name */
  name: string;
  /** Array of {@link GeneratorProvider `GeneratorProvider`} instances */
  providers: Array<GeneratorProvider>;
}
