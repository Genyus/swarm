import * as path from 'node:path';
import { getConfigManager } from '../config';
import { Generator, GeneratorProvider, GeneratorServices } from '../generator';
import { PluginResolver } from './plugin-resolver';
import { Plugin } from './types';

/**
 * Main plugin management system
 */
export class PluginManager {
  private configManager = getConfigManager();
  private plugins: Map<string, Plugin> = new Map();
  private providers: Map<string, GeneratorProvider> = new Map();
  private resolver: PluginResolver = new PluginResolver();

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
   * Register a plugin and its generator providers
   * @param plugin Plugin to register
   */
  async registerPlugin(plugin: Plugin): Promise<void> {
    this.plugins.set(plugin.name, plugin);

    for (const provider of plugin.providers) {
      const tempServices: GeneratorServices = {
        fileSystem: {} as any,
        logger: {
          debug: () => {},
          info: () => {},
          success: () => {},
          warn: () => {},
          error: () => {},
        },
      };
      const tempGenerator = await provider.create(tempServices);
      this.providers.set(tempGenerator.name, provider);
    }
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
            await this.registerPlugin(plugin);
          }
        } catch (error) {
          console.warn(
            `Failed to load plugin '${pluginConfig.import}' from '${pluginConfig.from}' in ${applicationRoot}:`,
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
   * Get a generator provider by name
   * @param name Generator name
   * @returns Generator provider or undefined if not found
   */
  getGenerator(name: string): GeneratorProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Create a generator instance from a provider
   * @param name Generator name
   * @param services Generator services
   * @returns Generator instance or undefined if not found
   */
  async createGeneratorInstance(
    name: string,
    services: GeneratorServices
  ): Promise<Generator | undefined> {
    const provider = this.providers.get(name);
    if (!provider) {
      return undefined;
    }
    return await provider.create(services);
  }

  /**
   * Get all registered generator providers
   * @returns Array of all generator providers
   */
  getAllGenerators(): GeneratorProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get all enabled generator providers
   * @returns Array of enabled generator providers
   */
  getEnabledGenerators(): GeneratorProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get all enabled plugins
   * @returns Array of enabled plugins
   */
  getEnabledPlugins(): Plugin[] {
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
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Check if a generator provider is registered
   * @param name Generator name
   * @returns True if generator provider is registered
   */
  hasGenerator(name: string): boolean {
    return this.providers.has(name);
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
