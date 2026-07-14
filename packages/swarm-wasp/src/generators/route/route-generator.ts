import {
  formatDisplayName,
  type Out,
  toCamelCase,
  toPascalCase,
} from '@ingenyus/swarm';
import { CONFIG_TYPES, getRouteNameFromPath } from '../../common';
import { ComponentGeneratorBase } from '../base';
import type { SpecDeclaration } from '../config';
import { schema } from './schema';

export class RouteGenerator extends ComponentGeneratorBase<
  typeof schema,
  typeof CONFIG_TYPES.ROUTE
> {
  protected get componentType() {
    return CONFIG_TYPES.ROUTE;
  }

  description = 'Generates a Wasp Page and Route';
  schema = schema;

  async generate(args: Out<typeof schema>): Promise<void> {
    const { path: routePath, name, feature } = args;
    const routeName = toCamelCase(name || getRouteNameFromPath(routePath));
    const componentName = toPascalCase(routeName);
    const fileName = `${componentName}.tsx`;

    return this.handleGeneratorError(
      this.componentType,
      routeName,
      async () => {
        this.ensureWaspCompatible();

        const configPath = this.validateFeatureConfig(feature);
        const { targetDirectory } = this.ensureTargetDirectory(feature, 'page');
        const targetFile = `${targetDirectory}/${fileName}`;

        await this.generatePageFile(targetFile, componentName, args);
        this.updateConfigFile(feature, routeName, routePath, args, configPath);
      }
    );
  }

  private async generatePageFile(
    targetFile: string,
    componentName: string,
    args: Out<typeof schema>
  ) {
    const _templatePath = 'files/client/page.eta';
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
    args: Out<typeof schema>,
    configPath: string
  ) {
    const definition = this.getDefinition(routeName, routePath, args.auth);

    this.updateConfigWithCheck(
      configPath,
      definition,
      featurePath,
      args.force || false
    );
  }

  /**
   * Builds a native route spec declaration for the feature configuration.
   */
  getDefinition(
    routeName: string,
    routePath: string,
    auth = false
  ): SpecDeclaration {
    const componentName = toPascalCase(routeName);
    const from = this.getRelativeRefPath('page', componentName);
    const pageArgs = auth
      ? `${componentName}, { authRequired: true }`
      : componentName;

    return {
      kind: 'route',
      call: `route("${routeName}", "${routePath}", page(${pageArgs}))`,
      refImports: [{ names: [componentName], from }],
    };
  }
}
