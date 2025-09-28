import path from 'path';
import { ApiFlags } from '../types';
import { getFeatureImportPath } from '../utils/filesystem';
import { stripSuffix, toPascalCase } from '../utils/strings';
import { BaseGenerator } from './base';

export class ApiGenerator extends BaseGenerator<ApiFlags> {
  async generate(featurePath: string, flags: ApiFlags): Promise<void> {
    const suffix = 'Api';
    const baseName = stripSuffix(flags.name, suffix);
    const apiName = baseName + suffix;
    const fileName = `${baseName}.ts`;
    const { targetDirectory, importDirectory } = this.ensureTargetDirectory(
      featurePath,
      'api'
    );

    return this.handleGeneratorError('API', apiName, async () => {
      const targetFile = path.join(targetDirectory, fileName);

      this.generateApiFile(targetFile, apiName, flags);
      this.updateConfigFile(
        featurePath,
        apiName,
        fileName,
        importDirectory,
        flags
      );
    });
  }

  private generateApiFile(
    targetFile: string,
    apiName: string,
    { method, auth = false, force = false }: ApiFlags
  ) {
    const replacements = this.buildTemplateData(apiName, method, auth);
    const templatePath = path.join('files', 'server', 'api.eta');

    this.renderTemplateToFile(
      templatePath,
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
    flags: ApiFlags
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
      const importPath = path.join(importDirectory, apiFile);
      const definition = this.getConfigDefinition(
        apiName,
        featurePath,
        Array.isArray(entities) ? entities : entities ? [entities] : [],
        method,
        route,
        apiFile,
        auth,
        importPath
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

  /**
   * Generates an API definition for the feature configuration.
   */
  private getConfigDefinition(
    apiName: string,
    featurePath: string,
    entities: string[],
    method: string,
    route: string,
    apiFile: string,
    auth = false,
    importPath: string
  ): string {
    const featureDir = getFeatureImportPath(featurePath);
    const templatePath = 'config/api.eta';

    return this.templateUtility.processTemplate(templatePath, {
      apiName,
      featureDir,
      entities: entities.map((e) => `"${e}"`).join(', '),
      method,
      route,
      apiFile,
      auth: String(auth),
      importPath,
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
