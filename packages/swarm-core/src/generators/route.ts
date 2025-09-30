import { RouteFlags } from '../types';
import { getRouteNameFromPath } from '../utils/filesystem';
import { formatDisplayName, toCamelCase, toPascalCase } from '../utils/strings';
import { BaseGenerator } from './base';

export class RouteGenerator extends BaseGenerator<RouteFlags> {
  protected entityType = 'Route';

  async generate(featurePath: string, flags: RouteFlags): Promise<void> {
    const { path: routePath, name } = flags;
    const routeName = toCamelCase(name || getRouteNameFromPath(routePath));
    const componentName = toPascalCase(routeName);
    const fileName = `${componentName}.tsx`;
    const { targetDirectory } = this.ensureTargetDirectory(featurePath, 'page');

    return this.handleGeneratorError(this.entityType, routeName, async () => {
      const targetFile = `${targetDirectory}/${fileName}`;

      this.generatePageFile(targetFile, componentName, flags);
      this.updateConfigFile(featurePath, routeName, routePath, flags);
    });
  }

  private generatePageFile(
    targetFile: string,
    componentName: string,
    flags: RouteFlags
  ) {
    const templatePath = 'files/client/page.eta';
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
      const definition = this.getDefinition(
        routeName,
        routePath,
        featurePath,
        flags.auth
      );

      this.updateFeatureConfig(
        featurePath,
        definition,
        configPath,
        configExists,
        this.entityType
      );
    }
  }

  /**
   * Generates a route definition for the feature configuration.
   */
  getDefinition(
    routeName: string,
    routePath: string,
    featurePath: string,
    auth = false
  ): string {
    const templatePath = 'config/route.eta';

    return this.templateUtility.processTemplate(templatePath, {
      featureName: featurePath.split('/').pop() || featurePath,
      routeName,
      routePath,
      auth: String(auth),
    });
  }
}
