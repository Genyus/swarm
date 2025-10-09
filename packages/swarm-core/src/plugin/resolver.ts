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
      const packagePath = await this.resolvePackagePath(packageName, applicationRoot);

      if (!packagePath) {
        console.warn('Could not resolve package path for:', packageName);

        return null;
      }

      let manifest: SwarmPluginManifest | null = null;

      try {
        const path = await import('node:path');
        const fs = await import('node:fs');
        const packageJsonPath = path.join(packagePath, 'package.json');

        if (fs.existsSync(packageJsonPath)) {
          const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
          const packageJson = JSON.parse(packageJsonContent);

          manifest = packageJson.swarm;
        }
      } catch (error) {
        console.error('Could not load package.json manifest:', error);
      }

      let plugin: any = null;

      if (manifest?.swarm?.plugins) {
        const targetPluginName = pluginName || this.getDefaultPluginName(manifest.swarm.plugins);
        const pluginEntry = manifest.swarm.plugins[targetPluginName];

        if (pluginEntry) {
          const path = await import('node:path');
          const entryPath = path.join(packagePath, pluginEntry.entry);
          const pluginModule = await import(entryPath);

          plugin = pluginEntry.name ? pluginModule[pluginEntry.name] : pluginModule.default;
        }
      } else {
        const path = await import('node:path');
        const fs = await import('node:fs');
        const packageJsonPath = path.join(packagePath, 'package.json');

        if (fs.existsSync(packageJsonPath)) {
          const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
          const packageJson = JSON.parse(packageJsonContent);
          const mainPath = path.join(packagePath, packageJson.main || 'index.js');
          const packageModule = await import(mainPath);

          if (pluginName) {
            plugin = packageModule[pluginName];

            if (typeof plugin === 'function') {
              plugin = plugin();
            }
          } else {
            plugin = packageModule.default;
          }
        }
      }

      return this.validatePlugin(plugin);
    } catch (error) {
      console.error('Failed to resolve plugin from manifest:', error);
      return null;
    }
  }

  /**
   * Resolve the actual file system path to a package using Node.js module resolution
   * @param packageName The package name to resolve
   * @param applicationRoot The application root directory
   * @returns Promise that resolves to the package path or null if not found
   */
  private async resolvePackagePath(packageName: string, applicationRoot?: string): Promise<string | null> {
    try {
      const path = await import('node:path');
      const fs = await import('node:fs');

      const startDir = applicationRoot || process.cwd();

      try {
        const { createRequire } = await import('module');
        const require = createRequire(startDir + '/package.json');
        const resolvedPath = require.resolve(packageName);
        let packageDir = path.dirname(resolvedPath);

        while (packageDir !== path.dirname(packageDir)) {
          const packageJsonPath = path.join(packageDir, 'package.json');

          if (fs.existsSync(packageJsonPath)) {
            const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
            const packageJson = JSON.parse(packageJsonContent);

            if (packageJson.name === packageName) {
              return packageDir;
            }
          }

          packageDir = path.dirname(packageDir);
        }
      } catch (resolveError) {
        console.error('createRequire.resolve failed:', resolveError);
      }

      let currentDir = startDir;

      while (currentDir !== path.dirname(currentDir)) {
        const nodeModulesPath = path.join(currentDir, 'node_modules', packageName);

        if (fs.existsSync(nodeModulesPath)) {
          return nodeModulesPath;
        }

        currentDir = path.dirname(currentDir);
      }

      console.warn('package not found in any node_modules');

      return null;
    } catch (error) {
      console.error('Error resolving package path:', error);

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
    try {
      if (!pluginId.startsWith('./') && !pluginId.startsWith('../')) {
        return null;
      }

      // Resolve the path relative to application root
      let resolvedPath = pluginId;

      if (applicationRoot) {
        const path = await import('node:path');

        resolvedPath = `${path.resolve(applicationRoot, pluginId)}/dist/index.js`;
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
    console.log('name:', plugin ? JSON.stringify(plugin, null, 2) : 'null');
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
