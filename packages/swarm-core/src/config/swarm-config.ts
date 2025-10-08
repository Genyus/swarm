import lilconfigTsLoader from '@sliphua/lilconfig-ts-loader';
import { lilconfig } from 'lilconfig';

/**
 * Swarm configuration interface
 */
export interface SwarmConfig {
  plugins: {
    [pluginName: string]: {
      enabled: boolean;
      generators?: {
        [generatorName: string]: {
          enabled: boolean;
          config?: Record<string, any>;
        };
      };
      config?: Record<string, any>;
    };
  };
}

/**
 * Manages Swarm configuration loading and access
 */
export class SwarmConfigManager {
  private config: SwarmConfig | null = null;
  private configPath: string | null = null;
  private lilconfig: any;

  constructor(
    private searchPlaces: string[] = [
      'swarm.config.ts',
      'swarm.config.js',
      'swarm.config.json',
    ]
  ) {
    this.lilconfig = lilconfig('swarm', {
      searchPlaces: this.searchPlaces,
      loaders: {
        '.ts': lilconfigTsLoader,
        '.js': lilconfigTsLoader,
        '.json': lilconfigTsLoader,
      },
    });
  }

  /**
   * Load configuration from file
   * @param configPath Optional specific config file path
   * @returns Loaded configuration
   */
  async loadConfig(configPath?: string): Promise<SwarmConfig> {
    try {
      const result = await this.lilconfig.load(configPath);

      if (!result) {
        throw new Error('No configuration file found');
      }

      this.config = result.config;
      this.configPath = result.filepath;

      return this.config!;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to load configuration: ${message}`);
    }
  }

  /**
   * Get the currently loaded configuration
   * @returns Current configuration or null if not loaded
   */
  getConfig(): SwarmConfig | null {
    return this.config;
  }

  /**
   * Get the path to the loaded configuration file
   * @returns Configuration file path or null if not loaded
   */
  getConfigPath(): string | null {
    return this.configPath;
  }

  /**
   * Check if a plugin is enabled
   * @param pluginName Name of the plugin
   * @returns True if plugin is enabled
   */
  isPluginEnabled(pluginName: string): boolean {
    return this.config?.plugins?.[pluginName]?.enabled ?? false;
  }

  /**
   * Check if a generator is enabled
   * @param pluginName Name of the plugin
   * @param generatorName Name of the generator
   * @returns True if generator is enabled
   */
  isGeneratorEnabled(pluginName: string, generatorName: string): boolean {
    return (
      this.config?.plugins?.[pluginName]?.generators?.[generatorName]
        ?.enabled ?? false
    );
  }

  /**
   * Get plugin configuration
   * @param pluginName Name of the plugin
   * @returns Plugin configuration or undefined
   */
  getPluginConfig(pluginName: string): Record<string, any> | undefined {
    return this.config?.plugins?.[pluginName]?.config;
  }

  /**
   * Get generator configuration
   * @param pluginName Name of the plugin
   * @param generatorName Name of the generator
   * @returns Generator configuration or undefined
   */
  getGeneratorConfig(
    pluginName: string,
    generatorName: string
  ): Record<string, any> | undefined {
    return this.config?.plugins?.[pluginName]?.generators?.[generatorName]
      ?.config;
  }
}
