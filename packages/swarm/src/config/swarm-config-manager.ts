import { AsyncSearcher, LilconfigResult, lilconfig } from 'lilconfig';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_CONFIG_FILE, DEFAULT_CUSTOM_TEMPLATES_DIR } from '../common';

/**
 * Swarm configuration interface
 *
 * Configuration can be loaded from swarm.config.json or the `swarm` section in package.json
 *
 * - `templateDirectory` is an optional string to specify the directory where the templates are located (defaults to `.swarm/templates`)
 * - `plugins[].import` is the name of the plugin to import
 * - `plugins[].from` is the package name or path where the plugin will be imported from
 * - `plugins[].disabled` is an optional boolean to explicitly disable the plugin (defaults to enabled)
 * - `plugins[].generators` is an optional array that can be used to disable specific generators
 * - `plugins[].generators[].disabled` is an optional boolean to explicitly disable the generator (defaults to enabled)
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
export interface SwarmConfig {
  templateDirectory?: string;
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
const DEFAULT_CONFIG: SwarmConfig = {
  templateDirectory: DEFAULT_CUSTOM_TEMPLATES_DIR,
  plugins: [],
};

/**
 * Manages Swarm configuration loading and access
 */
export class SwarmConfigManager {
  private config: SwarmConfig | null = null;
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
    let currentDir: string;

    if (startDir) {
      currentDir = startDir;
    } else {
      const moduleDir = path.dirname(fileURLToPath(import.meta.url));
      const segments = moduleDir.split(path.sep);
      const nodeModulesIndex = segments.lastIndexOf('node_modules');

      if (nodeModulesIndex !== -1) {
        const rootSegments = segments.slice(0, nodeModulesIndex);
        currentDir =
          rootSegments.length > 0 ? rootSegments.join(path.sep) : path.sep;
      } else {
        currentDir = process.cwd();
      }
    }

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

      if (configPath) {
        // If a specific config path is provided, load directly
        try {
          result = await this.lilconfig.load(configPath);
        } catch (e) {
          // Ignore errors for specific path
        }
      } else {
        // Use lilconfig's search which handles searchPlaces and package.json key extraction
        result = await this.lilconfig.search(searchDir);
      }

      if (!result || !result.config) {
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
      this.configPath = result.filepath || null;

      if (this.config && !this.config.templateDirectory) {
        this.config.templateDirectory = DEFAULT_CUSTOM_TEMPLATES_DIR;
      }

      // Check if no plugins are defined and warn the user
      if (
        this.config &&
        (!this.config.plugins || this.config.plugins.length === 0)
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
}
