import { SwarmGenerator } from '../generator';
import { PluginManager } from './plugin-manager';

/**
 * Base interface for managing generator-to-interface conversion
 * Provides common patterns for CLI commands and MCP tools
 */
export abstract class PluginInterfaceManager<TInterface> {
  protected initialized = false;
  protected pluginManager: PluginManager;
  protected interfaces: Record<string, TInterface> = {};

  constructor() {
    this.pluginManager = new PluginManager();
  }

  /**
   * Initialize the manager by loading plugins and creating interfaces
   */
  async initialize(configPath?: string): Promise<void> {
    if (this.initialized) return;

    try {
      await this.pluginManager.initialize(configPath);
      const generators = this.pluginManager.getEnabledGenerators();

      this.interfaces = {};

      for (const generator of generators) {
        try {
          const interfaceItem =
            await this.createInterfaceFromGenerator(generator);
          this.interfaces[generator.name] = interfaceItem;
        } catch (error) {
          this.handleInterfaceCreationError(generator.name, error);
        }
      }

      this.initialized = true;
    } catch (error) {
      this.handleInitializationError(error);
      throw error;
    }
  }

  /**
   * Get all created interfaces
   */
  getInterfaces(): Record<string, TInterface> {
    this.ensureInitialized();
    return this.interfaces;
  }

  /**
   * Get a specific interface by name
   */
  getInterface(name: string): TInterface | undefined {
    this.ensureInitialized();
    return this.interfaces[name];
  }

  /**
   * Refresh interfaces by reloading plugins and rebuilding
   */
  async refresh(): Promise<void> {
    this.initialized = false;
    this.pluginManager = new PluginManager();
    await this.initialize();
  }

  /**
   * Get the plugin manager instance
   */
  getPluginManager(): PluginManager {
    return this.pluginManager;
  }

  /**
   * Check if the manager is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Abstract method to create an interface from a generator
   * Must be implemented by concrete classes
   */
  protected abstract createInterfaceFromGenerator(
    generator: SwarmGenerator
  ): Promise<TInterface>;

  /**
   * Handle interface creation errors
   * Can be overridden by concrete classes for custom error handling
   */
  protected handleInterfaceCreationError(
    generatorName: string,
    error: unknown
  ): void {
    console.warn(
      `Failed to create interface for generator '${generatorName}':`,
      error
    );
  }

  /**
   * Handle initialization errors
   * Can be overridden by concrete classes for custom error handling
   */
  protected handleInitializationError(error: unknown): void {
    console.error('Failed to initialize generator interface manager:', error);
  }

  /**
   * Ensure the manager is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        'GeneratorInterfaceManager not initialized. Call initialize() first.'
      );
    }
  }
}
