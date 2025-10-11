import {
  formatDisplayName,
  toCamelCase,
  toPascalCase,
} from '@ingenyus/swarm-core';
import { getRouteNameFromPath } from '../../common';
import { RouteFlags } from '../../generators/args.types';
import { CONFIG_TYPES } from '../../types';
import { EntityGeneratorBase } from '../base';
import { schema } from './schema';

export class RouteGenerator extends EntityGeneratorBase<
  typeof CONFIG_TYPES.ROUTE
> {
  protected get entityType() {
    return CONFIG_TYPES.ROUTE;
  }

  description = 'Generate route handlers for Wasp applications';
  schema = schema;

  async generate(flags: RouteFlags): Promise<void> {
    const { path: routePath, name, feature } = flags;
    const routeName = toCamelCase(name || getRouteNameFromPath(routePath));
    const componentName = toPascalCase(routeName);
    const fileName = `${componentName}.tsx`;

    return this.handleGeneratorError(this.entityType, routeName, async () => {
      const configPath = this.validateFeatureConfig(feature);
      const { targetDirectory } = this.ensureTargetDirectory(feature, 'page');
      const targetFile = `${targetDirectory}/${fileName}`;

      this.generatePageFile(targetFile, componentName, flags);
      this.updateConfigFile(feature, routeName, routePath, flags, configPath);
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
      'page.eta',
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
    flags: RouteFlags,
    configPath: string
  ) {
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
    const templatePath = this.getTemplatePath('route.eta');

    return this.templateUtility.processTemplate(templatePath, {
      featureName: featurePath.split('/').pop() || featurePath,
      routeName,
      routePath,
      auth: String(auth),
    });
  }
}
