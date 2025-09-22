import path from 'node:path';
import { OPERATION_TYPES, TYPE_DIRECTORIES } from '../types';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import { handleFatalError } from '../utils/errors';
import {
  copyDirectory,
  findWaspRoot,
  getConfigDir,
  getFeatureImportPath,
  getTemplatesDir,
} from '../utils/filesystem';
import { getPlural, validateFeaturePath } from '../utils/strings';
import { TemplateUtility } from '../utils/templates';

export class FeatureGenerator implements IFeatureGenerator {
  private templateUtility: TemplateUtility;

  constructor(
    private logger: Logger,
    private fs: IFileSystem
  ) {
    this.templateUtility = new TemplateUtility(fs);
    this.logger = logger;
    this.fs = fs;
  }

  /**
   * Generates a route definition for the feature configuration.
   */
  getRouteDefinition(
    routeName: string,
    routePath: string,
    componentName: string,
    featurePath: string,
    auth = false
  ): string {
    const featureDir = getFeatureImportPath(featurePath);
    const templatePath = this.templateUtility.getConfigTemplatePath('route');
    const template = this.fs.readFileSync(templatePath, 'utf8');

    return this.templateUtility.processTemplate(template, {
      routeName,
      routePath,
      componentName,
      featureDir,
      auth: String(auth),
    });
  }

  /**
   * Generates an operation definition for the feature configuration.
   */
  getOperationDefinition(
    operationName: string,
    featurePath: string,
    entities: string[],
    operationType: 'query' | 'action'
  ): string {
    if (!OPERATION_TYPES.includes(operationType)) {
      handleFatalError(`Unknown operation type: ${operationType}`);
    }
    const directory = TYPE_DIRECTORIES[operationType];
    const featureDir = getFeatureImportPath(featurePath);
    const templatePath =
      this.templateUtility.getConfigTemplatePath('operation');
    const template = this.fs.readFileSync(templatePath, 'utf8');

    return this.templateUtility.processTemplate(template, {
      operationName,
      featureDir,
      directory,
      entities: entities.map((e) => `"${e}"`).join(', '),
    });
  }

  /**
   * Generates a job definition for the feature configuration.
   */
  getJobDefinition(
    jobName: string,
    jobWorkerName: string,
    jobWorkerFile: string,
    entitiesList: string,
    schedule: string,
    cron: string,
    args: string,
    importPath: string,
    queueName: string
  ): string {
    const templatePath = this.templateUtility.getConfigTemplatePath('job');
    const template = this.fs.readFileSync(templatePath, 'utf8');

    return this.templateUtility.processTemplate(template, {
      jobName,
      jobWorkerName,
      jobWorkerFile,
      entitiesList,
      schedule,
      cron,
      args,
      importPath,
      queueName,
    });
  }

  /**
   * Generates an API definition for the feature configuration.
   */
  getApiDefinition(
    apiName: string,
    featurePath: string,
    entities: string[],
    method: string,
    route: string,
    apiFile: string,
    auth = false
  ): string {
    const featureDir = getFeatureImportPath(featurePath);
    const templatePath = this.templateUtility.getConfigTemplatePath('api');
    const template = this.fs.readFileSync(templatePath, 'utf8');

    return this.templateUtility.processTemplate(template, {
      apiName,
      featureDir,
      entities: entities.map((e) => `"${e}"`).join(', '),
      method,
      route,
      apiFile,
      auth: String(auth),
    });
  }

  /**
   * Generates an apiNamespace definition for the feature configuration.
   */
  getApiNamespaceDefinition(
    namespaceName: string,
    middlewareFnName: string,
    middlewareImportPath: string,
    pathValue: string
  ): string {
    const templatePath =
      this.templateUtility.getConfigTemplatePath('apiNamespace');
    const template = this.fs.readFileSync(templatePath, 'utf8');

    return this.templateUtility.processTemplate(template, {
      namespaceName,
      middlewareFnName,
      middlewareImportPath,
      pathValue,
    });
  }

  /**
   * Removes an existing definition from the content by finding the opening line
   * and matching closing brace with the same indentation.
   * @param content - The file content
   * @param definition - The new definition to find the opening line from
   * @returns The content with the existing definition removed
   */
  private removeExistingDefinition(
    content: string,
    definition: string
  ): string {
    const lines = definition.split('\n');
    const firstNonEmptyLine = lines.find((line) => line.trim() !== '');

    if (!firstNonEmptyLine) {
      return content;
    }

    const openingLineIndex = content
      .split('\n')
      .findIndex((line) => line.trim() === firstNonEmptyLine.trim());

    if (openingLineIndex === -1) {
      return content;
    }

    const contentLines = content.split('\n');
    const openingLine = contentLines[openingLineIndex];
    const leadingSpaces = openingLine.match(/^(\s*)/)?.[1] || '';

    let closingLineIndex = -1;
    for (let i = openingLineIndex + 1; i < contentLines.length; i++) {
      const line = contentLines[i];
      const trimmedLine = line.trim();

      if (
        line.startsWith(leadingSpaces) &&
        (trimmedLine === '}' || trimmedLine === '},')
      ) {
        closingLineIndex = i;
        break;
      }
    }

    if (closingLineIndex === -1) {
      return content;
    }

    const newContentLines = [
      ...contentLines.slice(0, openingLineIndex),
      ...contentLines.slice(closingLineIndex + 1),
    ];

    return newContentLines.join('\n');
  }

  /**
   * Updates or creates a feature configuration file with new definitions.
   * @param featurePath - The path of the feature
   * @param type - The type of the configuration
   * @param options - The options for the configuration
   * @returns The path of the configuration file
   */
  public updateFeatureConfig(
    featurePath: string,
    type: string,
    options: Record<string, any> = {}
  ): string {
    const topLevelFeature = featurePath.split('/')[0];
    const configDir = getConfigDir(this.fs);
    const configPath = path.join(configDir, `${topLevelFeature}.wasp.ts`);

    if (!this.fs.existsSync(configPath)) {
      const templatesDir = getTemplatesDir(this.fs);
      const templatePath = path.join(templatesDir, 'config', 'feature.wasp.ts');
      if (!this.fs.existsSync(templatePath)) {
        handleFatalError(`Feature config template not found: ${templatePath}`);
      }
      this.fs.copyFileSync(templatePath, configPath);
    }

    let content = this.fs.readFileSync(configPath, 'utf8');
    let configSection: string = '';
    let definition: string = '';

    switch (type) {
      case 'route': {
        const {
          path: routePath,
          componentName,
          routeName,
          auth = false,
        } = options;

        configSection = 'routes';
        definition = this.getRouteDefinition(
          routeName,
          routePath,
          componentName,
          featurePath,
          auth
        );

        break;
      }
      case 'action':
      case 'query': {
        const { operationName, entities = [] } = options;

        configSection = getPlural(type);
        definition = this.getOperationDefinition(
          operationName,
          featurePath,
          entities,
          type
        );

        break;
      }
      case 'job': {
        const {
          jobName,
          jobWorkerName,
          jobWorkerFile,
          entitiesList = '',
          schedule = '',
          cron = '',
          args = '',
          importPath = '',
          queueName = '',
        } = options;

        configSection = 'jobs';
        definition = this.getJobDefinition(
          jobName,
          jobWorkerName,
          jobWorkerFile,
          entitiesList,
          schedule,
          cron,
          args,
          importPath,
          queueName
        );

        break;
      }
      case 'api': {
        const {
          apiName,
          entities = [],
          method,
          route,
          apiFile,
          auth = false,
        } = options;

        configSection = 'apis';
        definition = this.getApiDefinition(
          apiName,
          featurePath,
          entities,
          method,
          route,
          apiFile,
          auth
        );
        break;
      }
      case 'apiNamespace': {
        const {
          namespaceName,
          middlewareFnName,
          middlewareImportPath,
          path: pathValue,
        } = options;

        configSection = 'apiNamespaces';
        definition = this.getApiNamespaceDefinition(
          namespaceName,
          middlewareFnName,
          middlewareImportPath,
          pathValue
        );

        break;
      }
      case 'crud': {
        const { crudName, dataType, operations } = options;
        const templatePath = this.templateUtility.getConfigTemplatePath('crud');
        const template = this.fs.readFileSync(templatePath, 'utf8');
        const operationsStr = JSON.stringify(operations, null, 2)
          .replace(/"([^"]+)":/g, '$1:')
          .split('\n')
          .map((line, index) => (index === 0 ? line : '        ' + line))
          .join('\n');

        configSection = 'cruds';
        definition = this.templateUtility.processTemplate(template, {
          crudName,
          dataType,
          operations: operationsStr,
        });

        break;
      }
      default:
        handleFatalError(`Unknown configuration type: ${type}`);
    }

    // Remove existing definition before adding new one
    content = this.removeExistingDefinition(content, definition);

    const configBlock = `\n    ${configSection}: {${definition},\n    },`;

    if (content.includes('return {};')) {
      content = content.replace('return {};', `return {${configBlock}\n  };`);
    } else if (!content.includes(`${configSection}:`)) {
      content = content.replace(/return\s*{/, `return {${configBlock}`);
    } else {
      content = content.replace(
        new RegExp(`${configSection}:\\s*{`),
        `${configSection}: {${definition},`
      );
    }

    this.fs.writeFileSync(configPath, content);

    return configPath;
  }

  public generateFeatureConfig(featureName: string): void {
    const configDir = getConfigDir(this.fs);

    if (!this.fs.existsSync(configDir)) {
      this.fs.mkdirSync(configDir, { recursive: true });
    }

    const utilsPath = path.join(configDir, 'utils.ts');

    if (!this.fs.existsSync(utilsPath)) {
      const utilsTemplatePath = path.join(
        getTemplatesDir(this.fs),
        'config',
        'utils.ts'
      );

      if (this.fs.existsSync(utilsTemplatePath)) {
        this.fs.copyFileSync(utilsTemplatePath, utilsPath);
        this.logger.info(`✓ Created config/utils.ts`);
      }
    }

    const templatesDir = getTemplatesDir(this.fs);
    const templatePath = path.join(templatesDir, 'config', 'feature.wasp.ts');

    if (!this.fs.existsSync(templatePath)) {
      this.logger.error(`Template not found: ${templatePath}`);

      return;
    }

    const featureKey = featureName.replace(/[^a-zA-Z0-9]/g, '');
    const content = this.fs
      .readFileSync(templatePath, 'utf8')
      .replace(/\$\{FEATURE_NAME\}/g, featureName)
      .replace(/\$\{FEATURE_KEY\}/g, featureKey);
    const outputPath = path.join(configDir, `${featureName}.wasp.ts`);

    this.fs.writeFileSync(outputPath, content);
    this.logger.success(`Generated feature config: ${outputPath}`);
  }

  public generateFeature(featurePath: string): void {
    const segments = validateFeaturePath(featurePath);
    if (segments.length > 1) {
      const parentPath = segments.slice(0, -1).join('/');

      if (!this.fs.existsSync(parentPath)) {
        handleFatalError(
          `Parent feature '${parentPath}' does not exist. Please create it first.`
        );
        handleFatalError('Parent feature does not exist');
      }
    }

    const templateDir = path.join(
      getTemplatesDir(this.fs),
      'feature',
      segments.length === 1 ? '' : '_core'
    );
    const featureDir = path.join(
      findWaspRoot(this.fs, featurePath),
      'src',
      'features',
      featurePath
    );

    copyDirectory(this.fs, templateDir, featureDir);
    this.logger.debug(`Copied template from ${templateDir} to ${featureDir}`);

    if (segments.length === 1) {
      this.generateFeatureConfig(featurePath);
    }

    this.logger.success(
      `Generated ${
        segments.length === 1 ? 'top-level ' : 'sub-'
      }feature: ${featurePath}`
    );
  }
}
