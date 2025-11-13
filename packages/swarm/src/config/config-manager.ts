import { AsyncSearcher, LilconfigResult, lilconfig } from 'lilconfig';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  DEFAULT_CONFIG_FILE,
  DEFAULT_CUSTOM_TEMPLATES_DIR,
  LogLevel,
  findPackageJson,
  hasWorkspaceConfig,
} from '../common';

/**
 * Configuration interface
 *
 * Configuration can be loaded from swarm.config.json or the `swarm` section in package.json
 *
 * - `templateDirectory` is an optional string to specify the directory where the templates are located (defaults to `.swarm/templates`)
 * - `plugins[].import` is the name of the plugin to import
 * - `plugins[].from` is the package name or path where the plugin will be imported from
 * - `plugins[].disabled` is an optional boolean to explicitly disable the plugin (defaults to enabled)
 * - `plugins[].generators` is an optional array that can be used to disable specific generators
 * - `plugins[].generators[].disabled` is an optional boolean to explicitly disable the generator (defaults to enabled)
 * - `logLevel` is an optional log level for MCP server logging: 'debug', 'info', 'warn', or 'error' (defaults to 'info')
 *
 * @example <caption>swarm.config.json (primary)</caption>
 *
 * ```json
 *          {
 *            "templateDirectory": "templates",
 *            "plugins": [
 *              {
 *                "import": "wasp",
 *                "from": "@ingenyus/swarm-wasp"
 *                "disabled": false,
 *                "generators": {
 *                  "api": {
 *                    "disabled": true
 *                  }
 *                }
 *              }
 *            ]
 *          }
 * ```
 *
 * @example <caption>package.json (fallback)</caption>
 * ```json
 *         {
 *           "name": "my-app",
 *           "swarm": {
 *            "templateDirectory": ".swarm/templates",
 *             "plugins": [
 *               {
 *                 "import": "wasp",
 *                  "from": "@ingenyus/swarm-wasp"
 *                  "disabled": false,
 *                  "generators": {
 *                    "api": {
 *                      "disabled": true
 *                    }
 *                  }
 *               }
 *             ]
 *           }
 *        }
 * ```
 */
export interface Config {
  templateDirectory?: string;
  logLevel?: LogLevel;
  plugins: Array<{
    import: string;
    from: string;
    disabled?: boolean;
    generators?: {
      [generatorName: string]: {
        disabled?: boolean;
      };
    };
  }>;
}

/**
 * Default configuration when no config file is found
 */
const DEFAULT_CONFIG: Config = {
  templateDirectory: DEFAULT_CUSTOM_TEMPLATES_DIR,
  logLevel: 'info',
  plugins: [],
};

/**
 * Manages configuration loading and access
 */
class ConfigManager {
  private config: Config | null = null;
  private configPath: string | null = null;
  private lilconfig: AsyncSearcher;

  constructor(
    private searchPlaces: string[] = [DEFAULT_CONFIG_FILE, 'package.json']
  ) {
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
    // Always start from process.cwd() when no startDir is provided
    // This ensures we search from the actual project directory where the command was invoked,
    // not from where the module is installed (which can be in npx cache or node_modules)
    const searchStartDir = startDir || process.cwd();
    const rootDir = path.parse(searchStartDir).root;
    let currentDir = searchStartDir;

    while (currentDir !== rootDir) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      const nodeModulesPath = path.join(currentDir, 'node_modules');
      const swarmConfigPath = path.join(currentDir, DEFAULT_CONFIG_FILE);

      if (fs.existsSync(swarmConfigPath)) {
        return currentDir;
      }

      if (fs.existsSync(packageJsonPath)) {
        if (currentDir.includes('node_modules')) {
          currentDir = path.dirname(currentDir);

          continue;
        }

        try {
          const packageResult = findPackageJson(currentDir, {
            returnFirst: true,
          });

          if (packageResult && packageResult.directory === currentDir) {
            const { packageJson } = packageResult;

            if (packageJson.name && hasWorkspaceConfig(currentDir)) {
              return currentDir;
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
  async loadConfig(configPath?: string, projectRoot?: string): Promise<Config> {
    if (this.config) {
      return this.config;
    }

    try {
      let searchDir = projectRoot || this.findProjectRoot();

      if (!searchDir) {
        searchDir = process.cwd();
      }

      let result: LilconfigResult | null = null;

      if (configPath) {
        // If a specific config path is provided, load directly
        try {
          result = await this.lilconfig.load(configPath);
        } catch (e) {
          console.error(`Error loading config from ${configPath}: ${e}`);
        }
      } else {
        // Use lilconfig's search which handles searchPlaces and package.json key extraction
        result = await this.lilconfig.search(searchDir);
      }

      if (!result || !result.config) {
        // Use default configuration when no config file is found
        console.warn(
          `No configuration file found in ${searchDir}. Searched for: ${this.searchPlaces.join(', ')}`
        );
        console.warn('Using default configuration. No plugins are enabled.');

        this.config = { ...DEFAULT_CONFIG };
        this.configPath = null;
        return this.config;
      }

      this.config = result.config;
      this.configPath = result.filepath || null;

      if (this.config && !this.config.templateDirectory) {
        this.config.templateDirectory = DEFAULT_CUSTOM_TEMPLATES_DIR;
      }

      // Check if no plugins are defined and warn the user
      if (
        this.config &&
        (!this.config.plugins || this.config.plugins.length === 0)
      ) {
        console.warn('No plugins are defined in the configuration file.');
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
  getConfig(): Config | null {
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
   * Get the log level for MCP server logging
   * Priority: 1. Environment variable SWARM_MCP_LOG_LEVEL, 2. Config file logLevel, 3. Default 'info'
   * @returns Log level
   */
  getLogLevel(): LogLevel {
    // First check environment variable
    const envLevel = process.env['SWARM_MCP_LOG_LEVEL'];
    if (envLevel && ['debug', 'info', 'warn', 'error'].includes(envLevel)) {
      return envLevel as LogLevel;
    }

    // Fall back to config file value
    if (this.config?.logLevel) {
      return this.config.logLevel;
    }

    // Default to 'info'
    return 'info';
  }
}

const swarmConfigManager = new ConfigManager();

export function getConfigManager(): ConfigManager {
  return swarmConfigManager;
}
