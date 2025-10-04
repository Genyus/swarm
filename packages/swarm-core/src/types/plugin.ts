/**
 * Core Plugin Types for Swarm
 *
 * Defines the core plugin interfaces and types that all Swarm plugins must implement.
 * This provides the foundation for the plugin-based architecture.
 */

/**
 * Base interface that all Swarm plugins must implement
 */
export interface SwarmPlugin {
  /** Unique name of the plugin */
  name: string;
  /** Semantic version of the plugin */
  version: string;
  /** Optional description of the plugin */
  description?: string;
  /** Array of generators provided by this plugin */
  generators?: GeneratorPlugin[];
  /** Array of CLI commands provided by this plugin */
  commands?: CommandPlugin[];
  /** Array of MCP tools provided by this plugin */
  mcpTools?: MCPToolPlugin[];
  /** Dependencies required by this plugin */
  dependencies?: PluginDependency[];
  /** Plugin configuration schema for validation */
  configSchema?: PluginConfigSchema;
}

/**
 * Plugin dependency specification
 */
export interface PluginDependency {
  /** Name of the required plugin */
  name: string;
  /** Required version range (semver) */
  version: string;
  /** Whether this dependency is optional */
  optional?: boolean;
}

/**
 * Plugin configuration schema for validation
 */
export interface PluginConfigSchema {
  /** JSON Schema for plugin configuration validation */
  schema: Record<string, any>;
  /** Default configuration values */
  defaults?: Record<string, any>;
}

/**
 * Base interface for generator plugins
 */
export interface GeneratorPlugin {
  /** Unique name of the generator */
  name: string;
  /** Description of what this generator creates */
  description: string;
  /** Generator implementation class or function */
  generator: any; // Will be more specific when we implement the base classes
  /** Configuration schema for this generator */
  configSchema?: Record<string, any>;
}

/**
 * Base interface for command plugins
 */
export interface CommandPlugin {
  /** Command name (e.g., 'generate', 'create') */
  name: string;
  /** Command description */
  description: string;
  /** Command implementation */
  command: any; // Will be more specific when we implement the base classes
  /** Command options and arguments schema */
  options?: Record<string, any>;
}

/**
 * Base interface for MCP tool plugins
 */
export interface MCPToolPlugin {
  /** Tool name */
  name: string;
  /** Tool description */
  description: string;
  /** Tool implementation */
  tool: any; // Will be more specific when we implement the base classes
  /** Tool input/output schema */
  schema?: Record<string, any>;
}

/**
 * Plugin discovery result
 */
export interface PluginDiscoveryResult {
  /** Path to the plugin */
  path: string;
  /** Plugin configuration */
  config: SwarmPlugin;
  /** Whether the plugin was successfully loaded */
  loaded: boolean;
  /** Error message if loading failed */
  error?: string;
}

/**
 * Plugin manager interface
 */
export interface PluginManager {
  /** Discover and load all available plugins */
  discoverPlugins(): Promise<PluginDiscoveryResult[]>;
  /** Load a specific plugin by name */
  loadPlugin(name: string): Promise<SwarmPlugin | null>;
  /** Get all loaded plugins */
  getLoadedPlugins(): SwarmPlugin[];
  /** Get plugins by type */
  getPluginsByType(type: 'generator' | 'command' | 'mcpTool'): SwarmPlugin[];
  /** Unload a plugin */
  unloadPlugin(name: string): boolean;
}
