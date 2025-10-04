/**
 * Plugin Types for Swarm Wasp
 *
 * Temporary plugin interface definitions until they're moved to swarm-core
 */

export interface SwarmPlugin {
  name: string;
  version: string;
  generators?: any[];
  commands?: any[];
  mcpTools?: any[];
  dependencies?: PluginDependency[];
}

export interface PluginDependency {
  name: string;
  version: string;
}
