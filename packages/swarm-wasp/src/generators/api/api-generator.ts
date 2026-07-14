import { type Out, toCamelCase, toPascalCase } from '@ingenyus/swarm';
import { CONFIG_TYPES, ensureDirectoryExists } from '../../common';
import { ComponentGeneratorBase } from '../base';
import type { SpecDeclaration } from '../config';
import { schema } from './schema';

export class ApiGenerator extends ComponentGeneratorBase<
  typeof schema,
  typeof CONFIG_TYPES.API
> {
  protected get componentType() {
    return CONFIG_TYPES.API;
  }

  description = 'Generates a Wasp API Endpoint';
  schema = schema;

  async generate(args: Out<typeof schema>): Promise<void> {
    const apiName = toCamelCase(args.name);

    return this.handleGeneratorError(this.componentType, apiName, async () => {
      this.ensureWaspCompatible();

      const configPath = this.validateFeatureConfig(args.feature);
      const { targetDirectory: apiTargetDirectory } =
        this.ensureTargetDirectory(args.feature, this.name);
      const fileName = `${apiName}.ts`;
      const targetFile = `${apiTargetDirectory}/${fileName}`;

      await this.generateApiFile(targetFile, apiName, args);

      if (args.customMiddleware) {
        const middlewareTargetDirectory = this.path.join(
          apiTargetDirectory,
          'middleware'
        );

        ensureDirectoryExists(this.fileSystem, middlewareTargetDirectory);

        const middlewareFile = `${middlewareTargetDirectory}/${apiName}.ts`;

        this.generateMiddlewareFile(
          middlewareFile,
          `${apiName}Middleware`,
          args.force || false
        );
      }

      this.updateConfigFile(apiName, args, configPath);
    });
  }

  private async generateApiFile(
    targetFile: string,
    apiName: string,
    { method, auth = false, force = false }: Out<typeof schema>
  ) {
    const replacements = this.buildTemplateData(apiName, method, auth);

    await this.renderTemplateToFile(
      'api.eta',
      replacements,
      targetFile,
      'API Endpoint file',
      force
    );
  }

  private updateConfigFile(
    apiName: string,
    args: Out<typeof schema>,
    configFilePath: string
  ) {
    const { feature, force = false, entities, method, path, auth } = args;
    const entityList = Array.isArray(entities)
      ? entities
      : entities
        ? [entities]
        : [];
    const definition = this.getDefinition(
      apiName,
      method,
      path,
      entityList,
      auth || false,
      args.customMiddleware || false
    );

    this.updateConfigWithCheck(configFilePath, definition, feature, force);
  }

  /**
   * Builds a native api spec declaration for the feature configuration.
   */
  getDefinition(
    apiName: string,
    method: string,
    route: string,
    entities: string[],
    auth: boolean,
    customMiddleware: boolean
  ): SpecDeclaration {
    const refImports = [
      { names: [apiName], from: this.getRelativeRefPath('api', apiName) },
    ];

    let middleware: string | undefined;
    if (customMiddleware) {
      const middlewareName = `${apiName}Middleware`;
      middleware = `middlewareConfigFn: ${middlewareName}`;
      refImports.push({
        names: [middlewareName],
        from: this.getRelativeRefPath('api', `middleware/${apiName}`),
      });
    }

    const call = `api("${method}", "${route}", ${apiName}, ${this.configObject([
      middleware,
      entities.length ? `entities: ${this.stringArray(entities)}` : undefined,
      `auth: ${String(auth)}`,
    ])})`;

    return { kind: 'api', call, refImports };
  }

  private buildTemplateData(apiName: string, method: string, auth: boolean) {
    const apiType = toPascalCase(apiName);
    const authCheck = auth
      ? `  if (!context.user) {
  throw new HttpError(401);
}

`
      : '';
    const methodCheck =
      method !== 'ALL'
        ? `  if (req.method !== '${method}') {
  throw new HttpError(405);
}

`
        : '';
    const errorImport =
      auth || method !== 'ALL'
        ? 'import { HttpError } from "wasp/server";\n'
        : '';
    const imports = `${errorImport}import type { ${apiType} } from "wasp/server/api";`;

    return {
      imports,
      apiType,
      apiName,
      methodCheck,
      authCheck,
    };
  }
}
