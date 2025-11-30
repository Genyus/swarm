import {
  GeneratorServices,
  Out,
  toCamelCase,
  toPascalCase,
} from '@ingenyus/swarm';
import {
  CONFIG_TYPES,
  ensureDirectoryExists,
  getFeatureImportPath,
} from '../../common';
import { ComponentGeneratorBase } from '../base';
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

  constructor(services: GeneratorServices) {
    super(services);
  }

  async generate(args: Out<typeof schema>): Promise<void> {
    const apiName = toCamelCase(args.name);

    return this.handleGeneratorError(this.componentType, apiName, async () => {
      this.ensureWaspCompatible();

      const configPath = this.validateFeatureConfig(args.feature);
      const {
        targetDirectory: apiTargetDirectory,
        importDirectory: apiImportDirectory,
      } = this.ensureTargetDirectory(args.feature, this.name);
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
          apiName,
          args.force || false
        );
      }

      await this.updateConfigFile(
        apiName,
        fileName,
        apiImportDirectory,
        args,
        configPath
      );
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

  private async updateConfigFile(
    apiName: string,
    apiFile: string,
    importDirectory: string,
    args: Out<typeof schema>,
    configFilePath: string
  ) {
    const {
      feature,
      force = false,
      entities,
      method,
      path,
      auth,
      customMiddleware,
    } = args;
    const importPath = this.path.join(importDirectory, apiFile);
    const definition = await this.getConfigDefinition(
      apiName,
      feature,
      Array.isArray(entities) ? entities : entities ? [entities] : [],
      method,
      path,
      apiFile,
      auth,
      importPath,
      customMiddleware || false
    );

    this.updateConfigWithCheck(
      configFilePath,
      'addApi',
      apiName,
      definition,
      feature,
      force
    );
  }

  private async getConfigDefinition(
    apiName: string,
    featurePath: string,
    entities: string[],
    method: string,
    route: string,
    apiFile: string,
    auth = false,
    importPath: string,
    customMiddleware = false
  ): Promise<string> {
    const featureDir = getFeatureImportPath(featurePath);
    const configTemplatePath = await this.getTemplatePath('config/api.eta');

    return this.templateUtility.processTemplate(configTemplatePath, {
      apiName,
      featureDir,
      entities: entities.map((e) => `"${e}"`).join(', '),
      method,
      route,
      apiFile,
      auth: String(auth),
      importPath,
      customMiddleware: String(customMiddleware),
    });
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
