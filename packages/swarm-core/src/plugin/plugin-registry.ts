import * as path from 'node:path';
import { SwarmConfigManager } from '../config/swarm-config';
import { SwarmGenerator, SwarmPlugin } from '../contracts';
import {
  LocalPluginResolver,
  NPMPluginResolver,
  PluginResolver,
} from './plugin-resolver';

/**
 * Manages plugin registration and discovery
 */
export class PluginRegistry {
  private plugins: Map<string, SwarmPlugin> = new Map();
  private generators: Map<string, SwarmGenerator> = new Map();
  private npmResolver: NPMPluginResolver = new NPMPluginResolver();
  private localResolver: LocalPluginResolver = new LocalPluginResolver();

  constructor(private configManager: SwarmConfigManager) {}

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

    const applicationRoot = this.getApplicationRoot();

    for (const [packageName, pluginConfig] of Object.entries(config.plugins)) {
      if (pluginConfig.enabled) {
        try {
          let plugin: SwarmPlugin | null = null;

          if (packageName.startsWith('.')) {
            plugin = await this.localResolver.resolve(
              packageName,
              applicationRoot
            );
          } else {
            plugin = await this.npmResolver.resolveFromManifest(
              packageName,
              pluginConfig.plugin,
              applicationRoot
            );
          }

          if (plugin) {
            this.registerPlugin(plugin);

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
