import { ZodType } from 'zod';
import { GeneratorArgs, PluginGenerator } from '../generator/types';

/**
 * Core plugin interface for Swarm plugins
 */
export interface SwarmPlugin {
  /** Unique plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Human-readable description */
  description: string;
  /** Plugin author */
  author?: string;
  /** Plugin license */
  license?: string;

  /** Collection of generators provided by this plugin */
  generators: PluginGenerator<GeneratorArgs>[];

  /** Required Swarm version for compatibility */
  swarmVersion: string;

  /** Plugin configuration schema */
  configSchema?: ZodType;
}

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
