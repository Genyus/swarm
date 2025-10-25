import { formatDisplayName, toCamelCase, toPascalCase } from '@ingenyus/swarm';
import { getRouteNameFromPath } from '../../common';
import { CONFIG_TYPES } from '../../types';
import { EntityGeneratorBase } from '../base';
import { RouteArgs, schema } from './schema';

export class RouteGenerator extends EntityGeneratorBase<
  RouteArgs,
  typeof CONFIG_TYPES.ROUTE
> {
  protected get entityType() {
    return CONFIG_TYPES.ROUTE;
  }

  description = 'Generate route handlers for Wasp applications';
  schema = schema;

  async generate(args: RouteArgs): Promise<void> {
    const { path: routePath, name, feature } = args;
    const routeName = toCamelCase(name || getRouteNameFromPath(routePath));
    const componentName = toPascalCase(routeName);
    const fileName = `${componentName}.tsx`;

    return this.handleGeneratorError(this.entityType, routeName, async () => {
      const configPath = this.validateFeatureConfig(feature);
      const { targetDirectory } = this.ensureTargetDirectory(feature, 'page');
      const targetFile = `${targetDirectory}/${fileName}`;

      await this.generatePageFile(targetFile, componentName, args);
      this.updateConfigFile(feature, routeName, routePath, args, configPath);
    });
  }

  private async generatePageFile(
    targetFile: string,
    componentName: string,
    args: RouteArgs
  ) {
    const templatePath = 'files/client/page.eta';
    const replacements = {
      componentName,
      displayName: formatDisplayName(componentName),
    };

    await this.renderTemplateToFile(
      'page.eta',
      replacements,
      targetFile,
      'Page file',
      args.force || false
    );
  }

  private updateConfigFile(
    featurePath: string,
    routeName: string,
    routePath: string,
    args: RouteArgs,
    configPath: string
  ) {
    const definition = this.getDefinition(
      routeName,
      routePath,
      featurePath,
      args.auth
    );

    this.updateConfigWithCheck(
      configPath,
      'addRoute',
      routeName,
      definition,
      featurePath,
      args.force || false
    );
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
    const templatePath = this.getDefaultTemplatePath('config/route.eta');

    return this.templateUtility.processTemplate(templatePath, {
      featureName: featurePath.split('/').pop() || featurePath,
      routeName,
      routePath,
      auth: String(auth),
    });
  }
}
