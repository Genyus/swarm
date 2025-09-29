import path from 'node:path';
import { RouteFlags } from '../types';
import {
  getFeatureImportPath,
  getRouteNameFromPath,
} from '../utils/filesystem';
import { formatDisplayName, toPascalCase } from '../utils/strings';
import { BaseGenerator } from './base';

export class RouteGenerator extends BaseGenerator<RouteFlags> {
  async generate(featurePath: string, flags: RouteFlags): Promise<void> {
    const { path: routePath, name } = flags;
    const routeName = name || getRouteNameFromPath(routePath);
    const componentName = toPascalCase(routeName);
    const fileName = `${componentName}.tsx`;
    const { targetDirectory, importDirectory } = this.ensureTargetDirectory(
      featurePath,
      'page'
    );

    return this.handleGeneratorError('Route', routeName, async () => {
      const targetFile = path.join(targetDirectory, fileName);

      this.generatePageFile(targetFile, componentName, flags);
      this.updateConfigFile(
        featurePath,
        routeName,
        routePath,
        componentName,
        importDirectory,
        flags
      );
    });
  }

  private generatePageFile(
    targetFile: string,
    componentName: string,
    flags: RouteFlags
  ) {
    const templatePath = path.join('files', 'client', 'page.eta');
    const replacements = {
      componentName,
      displayName: formatDisplayName(componentName),
    };

    this.renderTemplateToFile(
      templatePath,
      replacements,
      targetFile,
      'Page file',
      flags.force || false
    );
  }

  private updateConfigFile(
    featurePath: string,
    routeName: string,
    routePath: string,
    componentName: string,
    importDirectory: string,
    flags: RouteFlags
  ) {
    const configPath = this.validateFeatureConfig(featurePath);
    const configExists = this.checkConfigExists(
      configPath,
      'addRoute',
      routeName,
      flags.force || false
    );

    if (!configExists || flags.force) {
      const importPath = path.join(importDirectory, componentName);
      const definition = this.getDefinition(
        routeName,
        routePath,
        componentName,
        featurePath,
        flags.auth,
        importPath
      );

      this.updateFeatureConfig(
        featurePath,
        definition,
        configPath,
        configExists,
        'Route'
      );
    }
  }

  /**
   * Generates a route definition for the feature configuration.
   */
  getDefinition(
    routeName: string,
    routePath: string,
    componentName: string,
    featurePath: string,
    auth = false,
    importPath: string
  ): string {
    const featureDir = getFeatureImportPath(featurePath);
    const templatePath = 'config/route.eta';

    return this.templateUtility.processTemplate(templatePath, {
      featureName: featurePath.split('/').pop() || featurePath,
      routeName,
      routePath,
      componentName,
      featureDir,
      auth: String(auth),
      importPath,
    });
  }
}
