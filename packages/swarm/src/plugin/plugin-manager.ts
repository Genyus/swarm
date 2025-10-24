import { SwarmConfigManager } from '../config';
import { GeneratorArgs, PluginGenerator } from '../generator';
import { PluginRegistry } from './plugin-registry';
import { SwarmPlugin } from './types';

/**
 * Main plugin management system
 */
export class PluginManager {
  private configManager: SwarmConfigManager;
  private registry: PluginRegistry;

  constructor() {
    this.configManager = new SwarmConfigManager();
    this.registry = new PluginRegistry(this.configManager);
  }

  /**
   * Initialize the plugin manager by loading configuration
   * @param configPath Optional specific config file path
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(configPath?: string): Promise<void> {
    await this.configManager.loadConfig(configPath);
    await this.registry.loadFromConfig();
  }

  /**
   * Register a plugin
   * @param plugin Plugin to register
   */
  registerPlugin(plugin: SwarmPlugin): void {
    this.registry.registerPlugin(plugin);
  }

  /**
   * Get a generator by name
   * @param name Generator name
   * @returns Generator or undefined if not found
   */
  getGenerator(name: string): PluginGenerator<GeneratorArgs> | undefined {
    return this.registry.getGenerator(name);
  }

  /**
   * Get all available generators
   * @returns Array of all generators
   */
  getAllGenerators(): PluginGenerator<GeneratorArgs>[] {
    return this.registry.getAllGenerators();
  }

  /**
   * Get all enabled plugins
   * @returns Array of enabled plugins
   */
  getEnabledPlugins(): SwarmPlugin[] {
    return this.registry.getEnabledPlugins();
  }

  /**
   * Check if a generator is available
   * @param name Generator name
   * @returns True if generator is available
   */
  hasGenerator(name: string): boolean {
    return this.registry.hasGenerator(name);
  }

  /**
   * Get the configuration manager
   * @returns Configuration manager instance
   */
  getConfigManager(): SwarmConfigManager {
    return this.configManager;
  }

  /**
   * Get the plugin registry
   * @returns Plugin registry instance
   */
  getRegistry(): PluginRegistry {
    return this.registry;
  }

  /**
   * Get all enabled generators from all enabled plugins
   * @returns Array of enabled generators
   */
  getEnabledGenerators(): PluginGenerator<GeneratorArgs>[] {
    return this.registry.getEnabledGenerators();
  }
}
