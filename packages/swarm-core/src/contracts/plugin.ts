import { ZodType } from 'zod';
import { SwarmGenerator } from './generator';

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
  generators: SwarmGenerator[];

  /** Required Swarm version for compatibility */
  swarmVersion: string;

  /** Plugin configuration schema */
  configSchema?: ZodType;
}

/**
 * Plugin dependency information
 */
export interface PluginDependency {
  /** Dependency name */
  name: string;
  /** Required version */
  version: string;
  /** Whether this dependency is optional */
  optional?: boolean;
}
