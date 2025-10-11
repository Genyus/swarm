import { toCamelCase, toPascalCase } from '@ingenyus/swarm-core';
import { getFeatureImportPath } from '../../common';
import { ApiFlags } from '../../generators/args.types';
import { CONFIG_TYPES } from '../../types';
import { EntityGeneratorBase } from '../base';
import { schema } from './schema';

export class ApiGenerator extends EntityGeneratorBase<typeof CONFIG_TYPES.API> {
  protected get entityType() {
    return CONFIG_TYPES.API;
  }

  description = 'Generate API endpoints for Wasp applications';
  schema = schema;

  async generate(flags: ApiFlags): Promise<void> {
    const apiName = toCamelCase(flags?.name);

    return this.handleGeneratorError(this.entityType, apiName, async () => {
      const configPath = this.validateFeatureConfig(flags.feature);
      const {
        targetDirectory: apiTargetDirectory,
        importDirectory: apiImportDirectory,
      } = this.ensureTargetDirectory(flags.feature, this.name);
      const fileName = `${apiName}.ts`;
      const targetFile = `${apiTargetDirectory}/${fileName}`;

      this.generateApiFile(targetFile, apiName, flags);

      if (flags.customMiddleware) {
        const { targetDirectory: middlewareTargetDirectory } =
          this.ensureTargetDirectory(flags.feature, 'middleware');
        const middlewareFile = `${middlewareTargetDirectory}/${apiName}.ts`;

        this.generateMiddlewareFile(
          middlewareFile,
          apiName,
          flags.force || false
        );
      }

      this.updateConfigFile(
        flags.feature,
        apiName,
        fileName,
        apiImportDirectory,
        flags,
        configPath
      );
    });
  }

  private generateApiFile(
    targetFile: string,
    apiName: string,
    { method, auth = false, force = false }: any
  ) {
    const replacements = this.buildTemplateData(apiName, method, auth);

    this.renderTemplateToFile(
      'api.eta',
      replacements,
      targetFile,
      'API endpoint file',
      force
    );
  }

  private updateConfigFile(
    featurePath: string,
    apiName: string,
    apiFile: string,
    importDirectory: string,
    flags: any,
    configFilePath: string
  ) {
    const { force = false, entities, method, route, auth } = flags;
    const importPath = this.path.join(importDirectory, apiFile);
    const definition = this.getConfigDefinition(
      apiName,
      featurePath,
      Array.isArray(entities) ? entities : entities ? [entities] : [],
      method,
      route,
      apiFile,
      auth,
      importPath,
      flags.customMiddleware || false
    );

    this.updateConfigWithCheck(
      configFilePath,
      'addApi',
      apiName,
      definition,
      featurePath,
      force
    );
  }

  private getConfigDefinition(
    apiName: string,
    featurePath: string,
    entities: string[],
    method: string,
    route: string,
    apiFile: string,
    auth = false,
    importPath: string,
    customMiddleware = false
  ): string {
    const featureDir = getFeatureImportPath(featurePath);
    const configTemplatePath = this.getTemplatePath('config/api.eta');

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
