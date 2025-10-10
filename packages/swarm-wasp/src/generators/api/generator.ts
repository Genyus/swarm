import { toCamelCase, toPascalCase } from '@ingenyus/swarm-core';
import { BaseEntityGenerator } from '../../base-classes/base-entity-generator';
import { ApiFlags } from '../../interfaces/generator-args';
import { CONFIG_TYPES } from '../../types/constants';
import { schema } from './schema';

export class ApiGenerator extends BaseEntityGenerator<typeof CONFIG_TYPES.API> {
  protected get entityType() {
    return CONFIG_TYPES.API;
  }

  description = 'Generate API endpoints for Wasp applications';
  schema = schema;

  async generate(flags: ApiFlags): Promise<void> {
    const apiName = toCamelCase(flags?.name);

    return this.handleGeneratorError(this.entityType, apiName, async () => {
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
        flags
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
    flags: any
  ) {
    const { force = false, entities, method, route, auth } = flags;
    const configFilePath = this.validateFeatureConfig(featurePath);
    const configExists = this.checkConfigExists(
      configFilePath,
      'addApi',
      apiName,
      force
    );

    if (!configExists || force) {
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

      this.updateFeatureConfig(
        featurePath,
        definition,
        configFilePath,
        configExists,
        'API'
      );
    }
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
    const featureDir = this.getFeatureImportPath(featurePath);
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
