import { toCamelCase, toPascalCase } from '@ingenyus/swarm';
import { getFeatureImportPath } from '../../common';
import { CONFIG_TYPES } from '../../types';
import { EntityGeneratorBase } from '../base';
import { ApiArgs, schema } from './schema';

export class ApiGenerator extends EntityGeneratorBase<
  ApiArgs,
  typeof CONFIG_TYPES.API
> {
  protected get entityType() {
    return CONFIG_TYPES.API;
  }

  description = 'Generate API endpoints for Wasp applications';
  schema = schema;

  async generate(args: ApiArgs): Promise<void> {
    const apiName = toCamelCase(args.name);

    return this.handleGeneratorError(this.entityType, apiName, async () => {
      const configPath = this.validateFeatureConfig(args.feature);
      const {
        targetDirectory: apiTargetDirectory,
        importDirectory: apiImportDirectory,
      } = this.ensureTargetDirectory(args.feature, this.name);
      const fileName = `${apiName}.ts`;
      const targetFile = `${apiTargetDirectory}/${fileName}`;

      await this.generateApiFile(targetFile, apiName, args);

      if (args.customMiddleware) {
        const { targetDirectory: middlewareTargetDirectory } =
          this.ensureTargetDirectory(args.feature, 'middleware');
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
    { method, auth = false, force = false }: ApiArgs
  ) {
    const replacements = this.buildTemplateData(apiName, method, auth);

    await this.renderTemplateToFile(
      'api.eta',
      replacements,
      targetFile,
      'API endpoint file',
      force
    );
  }

  private async updateConfigFile(
    apiName: string,
    apiFile: string,
    importDirectory: string,
    args: ApiArgs,
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
