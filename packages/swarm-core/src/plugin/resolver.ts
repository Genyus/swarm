import { SwarmPlugin } from '../interfaces/plugin';
import { SwarmPluginManifest } from '../interfaces/plugin-manifest';

/**
 * Interface for resolving plugins from different sources
 */
export interface PluginResolver {
  /**
   * Resolve a plugin by its identifier
   * @param pluginId The plugin identifier (e.g., '@ingenyus/swarm-wasp/wasp', './local-plugin')
   * @param applicationRoot The application root directory for resolving relative paths
   * @returns Promise that resolves to the plugin or null if not found
   */
  resolve(pluginId: string, applicationRoot?: string): Promise<SwarmPlugin | null>;
}

/**
 * Resolves plugins from NPM packages using package.json plugin declarations
 */
export class NPMPluginResolver implements PluginResolver {
  async resolve(pluginId: string, applicationRoot?: string): Promise<SwarmPlugin | null> {
    try {
      // Check if it's an NPM package format (contains @ or /)
      if (!pluginId.includes('@') && !pluginId.includes('/')) {
        return null;
      }

      // For now, we'll handle the old format for backward compatibility
      // In the future, this will be called with just the package name
      const parts = pluginId.split('/');
      const packageName = parts[0];
      const pluginPath = parts[1];

      // Try to import the plugin
      const pluginModule = await import(packageName);
      let plugin;

      if (pluginPath) {
        // Look for the specific plugin export
        plugin = pluginModule[pluginPath];
        // If it's a function, call it to get the plugin
        if (typeof plugin === 'function') {
          plugin = plugin();
        }
      } else {
        // Look for default export
        plugin = pluginModule.default;
      }

      return this.validatePlugin(plugin);
    } catch (error) {
      return null;
    }
  }

  /**
   * Resolve a plugin from a package using package.json manifest
   * @param packageName The NPM package name
   * @param pluginName The specific plugin name (optional, uses default if not provided)
   * @param applicationRoot The application root directory for resolving relative paths
   * @returns Promise that resolves to the plugin or null if not found
   */
  async resolveFromManifest(packageName: string, pluginName?: string, applicationRoot?: string): Promise<SwarmPlugin | null> {
    try {
      // Import the package
      const packageModule = await import(packageName);

      // Try to get the package.json manifest
      let manifest: SwarmPluginManifest | null = null;
      try {
        const packageJsonPath = `${packageName}/package.json`;
        const packageJson = await import(packageJsonPath);
        manifest = packageJson.default || packageJson;
      } catch (error) {
        // Package.json not found or not accessible
      }

      let plugin: any = null;

      if (manifest?.swarm?.plugins) {
        // Use manifest to find the plugin
        const targetPluginName = pluginName || this.getDefaultPluginName(manifest.swarm.plugins);
        const pluginEntry = manifest.swarm.plugins[targetPluginName];

        if (pluginEntry) {
          // Import the specific entry point
          const pluginModule = await import(`${packageName}/${pluginEntry.entry}`);
          plugin = pluginModule.default || pluginModule;
        }
      } else {
        // Fallback to direct import
        if (pluginName) {
          plugin = packageModule[pluginName];
          if (typeof plugin === 'function') {
            plugin = plugin();
          }
        } else {
          plugin = packageModule.default;
        }
      }

      return this.validatePlugin(plugin);
    } catch (error) {
      return null;
    }
  }

  private getDefaultPluginName(plugins: Record<string, any>): string {
    // Return the first plugin name as default
    const pluginNames = Object.keys(plugins);
    return pluginNames[0] || 'default';
  }

  private validatePlugin(plugin: any): SwarmPlugin | null {
    if (
      plugin &&
      typeof plugin === 'object' &&
      'name' in plugin &&
      'generators' in plugin &&
      Array.isArray(plugin.generators)
    ) {
      return plugin as SwarmPlugin;
    }
    return null;
  }
}

/**
 * Resolves plugins from local file paths
 */
export class LocalPluginResolver implements PluginResolver {
  async resolve(pluginId: string, applicationRoot?: string): Promise<SwarmPlugin | null> {
    console.log('resolving local plugin', pluginId, 'from', applicationRoot);
    try {
      // Check if it's a local path (starts with ./ or ../)
      if (!pluginId.startsWith('./') && !pluginId.startsWith('../')) {
        return null;
      }

      // Resolve the path relative to application root
      let resolvedPath = pluginId;
      if (applicationRoot) {
        const path = await import('node:path');
        resolvedPath = path.resolve(applicationRoot, pluginId);
      }

      // Try to import the plugin
      const pluginModule = await import(resolvedPath);
      const plugin = pluginModule.default || pluginModule;

      return this.validatePlugin(plugin);
    } catch (error) {
      console.error('Failed to resolve local plugin:', error);
      return null;
    }
  }

  private validatePlugin(plugin: any): SwarmPlugin | null {
    if (
      plugin &&
      typeof plugin === 'object' &&
      'name' in plugin &&
      'generators' in plugin &&
      Array.isArray(plugin.generators)
    ) {
      return plugin as SwarmPlugin;
    }
    return null;
  }
}

/**
 * Resolves built-in plugins for backward compatibility
 */
export class BuiltinPluginResolver implements PluginResolver {
  private builtinPlugins: Record<string, () => Promise<SwarmPlugin | null>> = {};

  constructor() {
    // Register built-in plugins
    this.builtinPlugins = {
      'wasp': () => this.loadWaspPlugin(),
      'react': () => this.loadReactPlugin(),
    };
  }

  async resolve(pluginId: string, applicationRoot?: string): Promise<SwarmPlugin | null> {
    const loader = this.builtinPlugins[pluginId];
    if (loader) {
      try {
        return await loader();
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  private async loadWaspPlugin(): Promise<SwarmPlugin | null> {
    try {
      // Try to load from swarm-wasp package using dynamic import
      const packageName = '@ingenyus/swarm-wasp';
      const waspPlugin = await import(packageName);
      return waspPlugin.getWaspPlugin ? waspPlugin.getWaspPlugin() : null;
    } catch (error) {
      // Fallback to local path in monorepo
      try {
        const localPath = '../../swarm-wasp/dist/index.js';
        const waspPlugin = await import(localPath);
        return waspPlugin.getWaspPlugin ? waspPlugin.getWaspPlugin() : null;
      } catch (fallbackError) {
        return null;
      }
    }
  }

  private async loadReactPlugin(): Promise<SwarmPlugin | null> {
    try {
      // Try to load from swarm-react package using dynamic import
      const packageName = '@ingenyus/swarm-react';
      const reactPlugin = await import(packageName);
      return reactPlugin.getReactPlugin ? reactPlugin.getReactPlugin() : null;
    } catch (error) {
      return null;
    }
  }
}
