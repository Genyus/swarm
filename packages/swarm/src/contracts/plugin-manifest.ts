/**
 * Plugin manifest interface for package.json
 */
export interface SwarmPluginManifest {
  swarm?: {
    plugins: {
      [pluginName: string]: {
        entry: string;
        name: string;
        description?: string;
        version?: string;
      };
    };
  };
}

/**
 * Plugin entry information
 */
interface PluginEntry {
  entry: string;
  name: string;
  description?: string;
  version?: string;
}
