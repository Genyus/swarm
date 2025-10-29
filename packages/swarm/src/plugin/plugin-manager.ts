import * as path from 'node:path';
import { SwarmConfigManager } from '../config';
import { Generator } from '../generator';
import { PluginResolver } from './plugin-resolver';
import { SwarmPlugin } from './types';

/**
 * Main plugin management system
 */
export class PluginManager {
  private configManager: SwarmConfigManager;
  private plugins: Map<string, SwarmPlugin> = new Map();
  private generators: Map<string, Generator> = new Map();
  private resolver: PluginResolver = new PluginResolver();

  constructor() {
    this.configManager = new SwarmConfigManager();
  }

  /**
   * Initialize the plugin manager by loading configuration
   * @param configPath Optional specific config file path
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(configPath?: string): Promise<void> {
    await this.configManager.loadConfig(configPath);
    await this.loadFromConfig();
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
  private async loadFromConfig(): Promise<void> {
    const config = this.configManager.getConfig();

    if (!config) {
      throw new Error('No configuration loaded');
    }

    const applicationRoot = this.getApplicationRoot();

    for (const pluginConfig of config.plugins) {
      if (pluginConfig.disabled !== true) {
        try {
          const plugin = await this.resolver.resolve(
            pluginConfig.from,
            pluginConfig.import,
            applicationRoot
          );

          if (plugin) {
            this.registerPlugin(plugin);

            plugin.generators.forEach((generator) => {
              const isEnabled =
                pluginConfig.generators?.[generator.name]?.disabled !== true;
              if (isEnabled) {
                this.generators.set(generator.name, generator);
              } else {
                this.generators.delete(generator.name);
              }
            });
          } else {
            console.warn(
              `Could not resolve plugin '${pluginConfig.import}' from '${pluginConfig.from}'`
            );
          }
        } catch (error) {
          console.warn(
            `Failed to load plugin '${pluginConfig.import}' from '${pluginConfig.from}':`,
            error
          );
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
  getGenerator(name: string): Generator | undefined {
    return this.generators.get(name);
  }

  /**
   * Get all registered generators
   * @returns Array of all generators
   */
  getAllGenerators(): Generator[] {
    return Array.from(this.generators.values());
  }

  /**
   * Get all enabled generators
   * @returns Array of enabled generators
   */
  getEnabledGenerators(): Generator[] {
    return Array.from(this.generators.values());
  }

  /**
   * Get all enabled plugins
   * @returns Array of enabled plugins
   */
  getEnabledPlugins(): SwarmPlugin[] {
    const config = this.configManager.getConfig();
    if (!config) return [];

    return Array.from(this.plugins.values()).filter((plugin) => {
      const pluginConfig = config.plugins.find((p) => p.import === plugin.name);

      return pluginConfig?.disabled !== true;
    });
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
}
