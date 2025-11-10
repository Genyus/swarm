import { SwarmGeneratorProvider } from '../generator/provider';

/**
 * Swarm plugin interface
 */
export interface SwarmPlugin {
  /** Unique plugin name */
  name: string;
  /** Array of {@link SwarmGeneratorProvider `SwarmGeneratorProvider`} instances */
  generators: Array<SwarmGeneratorProvider>;
}
