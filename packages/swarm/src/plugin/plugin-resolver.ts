import * as fs from 'node:fs';
import * as path from 'node:path';
import { SwarmPlugin } from './types';

/**
 * Unified plugin resolver using dynamic imports
 */
export class PluginResolver {
  /**
   * Resolve a plugin using dynamic import
   * @param from Plugin source (package name or local path)
   * @param importName Plugin name to import from source
   * @param applicationRoot Application root directory for resolving relative paths
   * @returns Promise that resolves to the plugin or null if not found
   */
  async resolve(
    from: string,
    importName: string,
    applicationRoot?: string
  ): Promise<SwarmPlugin | null> {
    try {
      const isLocal = this.isLocalSource(from);
      let resolvedSource = from;

      if (isLocal) {
        if (applicationRoot) {
          resolvedSource = path.resolve(applicationRoot, from);
        }
      } else {
        if (!applicationRoot) {
          applicationRoot = process.cwd();
        }

        const resolvedPath = await this.resolvePackageImportPath(
          from,
          applicationRoot
        );

        if (!resolvedPath) {
          console.warn(
            `Could not resolve package '${from}' from application root`
          );

          return null;
        }
        resolvedSource = resolvedPath;
      }

      const pluginModule = await import(resolvedSource);
      const plugin = pluginModule[importName];

      if (!plugin) {
        console.warn(`Plugin '${importName}' not found in source '${from}'`);

        return null;
      }

      const validatedPlugin = this.validatePlugin(plugin);

      if (!validatedPlugin) {
        return null;
      }

      if (!validatedPlugin.version && !isLocal) {
        const version = await this.extractVersionFromPackage(
          from,
          applicationRoot
        );

        if (version) {
          validatedPlugin.version = version;
        }
      }

      return validatedPlugin;
    } catch (error) {
      console.error(
        `Failed to resolve plugin '${importName}' from '${from}':`,
        error
      );

      return null;
    }
  }

  /**
   * Check if a source is a local plugin (contains '/' and doesn't start with '@')
   * @param from Plugin source
   * @returns True if local plugin
   */
  private isLocalSource(from: string): boolean {
    return from.includes('/') && !from.startsWith('@');
  }

  /**
   * Resolve the import path for an NPM package from application root
   * @param packageName Package name
   * @param applicationRoot Application root directory
   * @returns Resolved file path for import or null
   */
  private async resolvePackageImportPath(
    packageName: string,
    applicationRoot: string
  ): Promise<string | null> {
    try {
      const { createRequire } = await import('module');
      const require = createRequire(path.join(applicationRoot, 'package.json'));
      const resolvedPath = require.resolve(packageName);
      return resolvedPath;
    } catch (error) {
      // Fallback to manual resolution
      const packagePath = await this.resolvePackagePath(
        packageName,
        applicationRoot
      );

      if (!packagePath) {
        return null;
      }

      // Try to find the main entry point
      const packageJsonPath = path.join(packagePath, 'package.json');

      if (!fs.existsSync(packageJsonPath)) {
        return null;
      }

      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);
      const mainEntry = packageJson.main || packageJson.module || 'index.js';

      return path.join(packagePath, mainEntry);
    }
  }

  /**
   * Extract version from package.json for NPM packages
   * @param packageName Package name
   * @param applicationRoot Application root directory
   * @returns Version string or null
   */
  private async extractVersionFromPackage(
    packageName: string,
    applicationRoot?: string
  ): Promise<string | null> {
    try {
      const startDir = applicationRoot || process.cwd();
      const packagePath = await this.resolvePackagePath(packageName, startDir);

      if (!packagePath) {
        return null;
      }

      const packageJsonPath = path.join(packagePath, 'package.json');

      if (!fs.existsSync(packageJsonPath)) {
        return null;
      }

      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);

      return packageJson.version || null;
    } catch (error) {
      console.warn(`Could not extract version from package '${packageName}'`);
      return null;
    }
  }

  /**
   * Resolve the actual file system path to a package using Node.js module resolution
   * @param packageName The package name to resolve
   * @param applicationRoot Application root directory
   * @returns Promise that resolves to the package path or null if not found
   */
  private async resolvePackagePath(
    packageName: string,
    applicationRoot: string
  ): Promise<string | null> {
    try {
      try {
        const { createRequire } = await import('module');
        const require = createRequire(
          path.join(applicationRoot, 'package.json')
        );
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
        // Fall through to manual resolution
      }

      let currentDir = applicationRoot;

      while (currentDir !== path.dirname(currentDir)) {
        const nodeModulesPath = path.join(
          currentDir,
          'node_modules',
          packageName
        );

        if (fs.existsSync(nodeModulesPath)) {
          return nodeModulesPath;
        }

        currentDir = path.dirname(currentDir);
      }

      return null;
    } catch (error) {
      console.error('Error resolving package path:', error);

      return null;
    }
  }

  /**
   * Validate that the resolved object is a valid SwarmPlugin
   * @param plugin Plugin object to validate
   * @returns Validated plugin or null
   */
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
