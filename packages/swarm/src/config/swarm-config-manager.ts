import { AsyncSearcher, LilconfigResult, lilconfig } from 'lilconfig';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DEFAULT_CONFIG_FILE, DEFAULT_CUSTOM_TEMPLATES_DIR } from '../common';

/**
 * Swarm configuration interface
 */
export interface SwarmConfig {
  templateDirectory?: string;
  plugins: {
    [packageName: string]: {
      plugin?: string; // Specific plugin name within the package
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
 * Default configuration when no config file is found
 */
const DEFAULT_CONFIG: SwarmConfig = {
  templateDirectory: DEFAULT_CUSTOM_TEMPLATES_DIR,
  plugins: {},
};

/**
 * Manages Swarm configuration loading and access
 */
export class SwarmConfigManager {
  private config: SwarmConfig | null = null;
  private configPath: string | null = null;
  private lilconfig: AsyncSearcher;

  constructor(private searchPlaces: string[] = [DEFAULT_CONFIG_FILE]) {
    this.lilconfig = lilconfig('swarm', {
      searchPlaces: this.searchPlaces,
    });
  }

  /**
   * Find the project root directory by looking for common project indicators
   * @param startDir Optional starting directory for search
   * @returns Path to project root or null if not found
   */
  private findProjectRoot(startDir?: string): string | null {
    let currentDir = startDir || process.cwd();
    const rootDir = path.parse(currentDir).root;

    while (currentDir !== rootDir) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      const nodeModulesPath = path.join(currentDir, 'node_modules');
      const swarmConfigPath = path.join(currentDir, DEFAULT_CONFIG_FILE);

      if (fs.existsSync(swarmConfigPath)) {
        return currentDir;
      }

      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, 'utf8')
          );
          if (packageJson.name && !currentDir.includes('node_modules')) {
            // Check if this is a monorepo root by looking for workspace configuration
            const hasWorkspaceConfig =
              fs.existsSync(path.join(currentDir, 'pnpm-workspace.yaml')) ||
              fs.existsSync(path.join(currentDir, 'lerna.json')) ||
              (packageJson.workspaces && packageJson.workspaces.length > 0);

            if (hasWorkspaceConfig) {
              return currentDir; // This is likely the monorepo root
            }

            if (path.dirname(currentDir) === rootDir) {
              return currentDir;
            }
          }
        } catch (e) {
          // Ignore package.json parsing errors
        }
      }

      if (fs.existsSync(nodeModulesPath)) {
        return currentDir;
      }

      currentDir = path.dirname(currentDir);
    }

    return null;
  }

  /**
   * Load configuration from file
   * @param configPath Optional specific config file path
   * @param projectRoot Optional project root directory
   * @returns Loaded configuration
   */
  async loadConfig(
    configPath?: string,
    projectRoot?: string
  ): Promise<SwarmConfig> {
    try {
      let searchDir = projectRoot || this.findProjectRoot();

      if (!searchDir) {
        searchDir = process.cwd();
      }

      let result: LilconfigResult | null = null;

      for (const searchPlace of this.searchPlaces) {
        const fullPath = path.join(searchDir, searchPlace);

        try {
          result = await this.lilconfig.load(fullPath);

          if (result) break;
        } catch (e) {
          continue;
        }
      }

      if (!result) {
        // Use default configuration when no config file is found
        console.warn(
          `⚠️  No configuration file found in ${searchDir}. Searched for: ${this.searchPlaces.join(', ')}`
        );
        console.warn('Using default configuration. No plugins are enabled.');

        this.config = { ...DEFAULT_CONFIG };
        this.configPath = null;
        return this.config;
      }

      this.config = result.config;
      this.configPath = result.filepath;

      if (this.config && !this.config.templateDirectory) {
        this.config.templateDirectory = DEFAULT_CUSTOM_TEMPLATES_DIR;
      }

      // Check if no plugins are defined and warn the user
      if (
        this.config &&
        (!this.config.plugins || Object.keys(this.config.plugins).length === 0)
      ) {
        console.warn('⚠️  No plugins are defined in the configuration file.');
        console.warn('Swarm will not have any generators available.');
      }

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
