import * as path from 'node:path';
import { SwarmConfigManager } from '../config/swarm-config';
import { SwarmGenerator } from '../interfaces/generator';
import { SwarmPlugin } from '../interfaces/plugin';
import { BuiltinPluginResolver, LocalPluginResolver, NPMPluginResolver, PluginResolver } from './resolver';

/**
 * Manages plugin registration and discovery
 */
export class PluginRegistry {
  private plugins: Map<string, SwarmPlugin> = new Map();
  private generators: Map<string, SwarmGenerator> = new Map();
  private resolvers: PluginResolver[] = [];

  constructor(private configManager: SwarmConfigManager) {
    // Initialize resolvers in order of preference
    this.resolvers = [
      new NPMPluginResolver(),
      new LocalPluginResolver(),
      new BuiltinPluginResolver()
    ];
  }

  /**
   * Register a plugin and its generators
   * @param plugin Plugin to register
   */
  registerPlugin(plugin: SwarmPlugin): void {
    this.plugins.set(plugin.name, plugin);

    plugin.generators.forEach((generator) => {
      this.generators.set(generator.name, generator);
    });
  }

  /**
   * Load plugins from configuration
   * @returns Promise that resolves when loading is complete
   */
  async loadFromConfig(): Promise<void> {
    const config = this.configManager.getConfig();
    if (!config) {
      throw new Error('No configuration loaded');
    }

    // Get the application root from the config manager
    const applicationRoot = this.getApplicationRoot();

    // Load plugins dynamically based on configuration
    for (const [packageName, pluginConfig] of Object.entries(config.plugins)) {
      if (pluginConfig.enabled) {
        try {
          let plugin: SwarmPlugin | null = null;

          // Check if this is the new format (package name only)
          if (!packageName.includes('/') && !packageName.includes('@')) {
            // This is a simple plugin name, use builtin resolver
            plugin = await this.resolvePlugin(packageName, applicationRoot);
          } else if (packageName.includes('@') || !packageName.startsWith('.')) {
            // This is a package name, use NPM resolver with manifest
            const npmResolver = this.resolvers.find(r => r instanceof NPMPluginResolver) as NPMPluginResolver;
            if (npmResolver) {
              plugin = await npmResolver.resolveFromManifest(packageName, pluginConfig.plugin, applicationRoot);
            } else {
              // Fallback to old resolution method
              plugin = await this.resolvePlugin(packageName, applicationRoot);
            }
          } else {
            // This is a local path, use local resolver
            plugin = await this.resolvePlugin(packageName, applicationRoot);
          }

          if (plugin) {
            this.registerPlugin(plugin);

            // Enable/disable generators based on config
            plugin.generators.forEach((generator) => {
              const isEnabled =
                pluginConfig.generators?.[generator.name]?.enabled ?? true;
              if (isEnabled) {
                this.generators.set(generator.name, generator);
              } else {
                this.generators.delete(generator.name);
              }
            });
          } else {
            console.warn(`Could not resolve plugin '${packageName}'`);
          }
        } catch (error) {
          console.warn(`Failed to load plugin '${packageName}':`, error);
        }
      }
    }
  }

  /**
   * Get the application root directory from the config manager
   * @returns The application root directory path
   */
  private getApplicationRoot(): string | undefined {
    const configPath = this.configManager.getConfigPath();

    if (configPath) {
      return path.dirname(configPath);
    }

    return undefined;
  }

  /**
   * Resolve a plugin using available resolvers
   * @param pluginId The plugin identifier
   * @param applicationRoot The application root directory for resolving relative paths
   * @returns Resolved plugin or null if not found
   */
  private async resolvePlugin(pluginId: string, applicationRoot?: string): Promise<SwarmPlugin | null> {
    for (const resolver of this.resolvers) {
      try {
        const plugin = await resolver.resolve(pluginId, applicationRoot);
        if (plugin) {
          return plugin;
        }
      } catch (error) {
        // Try next resolver
        continue;
      }
    }
    return null;
  }

  /**
   * Get a generator by name
   * @param name Generator name
   * @returns Generator or undefined if not found
   */
  getGenerator(name: string): SwarmGenerator | undefined {
    return this.generators.get(name);
  }

  /**
   * Get all registered generators
   * @returns Array of all generators
   */
  getAllGenerators(): SwarmGenerator[] {
    return Array.from(this.generators.values());
  }

  /**
   * Get all enabled plugins
   * @returns Array of enabled plugins
   */
  getEnabledPlugins(): SwarmPlugin[] {
    const config = this.configManager.getConfig();
    if (!config) return [];

    return Array.from(this.plugins.values()).filter((plugin) =>
      this.configManager.isPluginEnabled(plugin.name)
    );
  }

  /**
   * Get all registered plugins
   * @returns Array of all plugins
   */
  getAllPlugins(): SwarmPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Check if a generator is registered
   * @param name Generator name
   * @returns True if generator is registered
   */
  hasGenerator(name: string): boolean {
    return this.generators.has(name);
  }

  /**
   * Check if a plugin is registered
   * @param name Plugin name
   * @returns True if plugin is registered
   */
  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Get all enabled generators
   * @returns Array of enabled generators
   */
  getEnabledGenerators(): SwarmGenerator[] {
    return Array.from(this.generators.values());
  }
}
