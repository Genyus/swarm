import { SwarmGenerator } from '../generator/types';

/**
 * Swarm plugin interface
 */
export interface SwarmPlugin {
  /** Unique plugin name */
  name: string;
  /** Array of {@link SwarmGenerator `SwarmGenerator`} instances */
  generators: Array<SwarmGenerator<any>>;
}
