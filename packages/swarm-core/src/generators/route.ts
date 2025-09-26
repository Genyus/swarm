import path from 'node:path';
import { RouteFlags } from '../types';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import {
  ensureDirectoryExists,
  getFeatureDir,
  getFeatureImportPath,
  getFeatureTargetDir,
  getRouteNameFromPath,
  getTemplatesDir,
} from '../utils/filesystem';
import { formatDisplayName, hasHelperMethodCall } from '../utils/strings';
import { TemplateUtility } from '../utils/templates';

export class RouteGenerator implements NodeGenerator<RouteFlags> {
  private templatesDir: string;
  private templateUtility: TemplateUtility;
  constructor(
    public logger: Logger,
    public fs: IFileSystem,
    private featureGenerator: IFeatureGenerator
  ) {
    this.templatesDir = getTemplatesDir(fs);
    this.templateUtility = new TemplateUtility(fs);
    this.logger = logger;
    this.fs = fs;
    this.featureGenerator = featureGenerator;
  }

  async generate(featurePath: string, flags: RouteFlags): Promise<void> {
    try {
      const { path: routePath, name, auth, force } = flags;
      const componentName = name || getRouteNameFromPath(routePath);
      const routeName = `${
        componentName.endsWith('Page')
          ? componentName.slice(0, -4)
          : componentName
      }Route`;
      const { targetDirectory: pagesDir, importDirectory } =
        getFeatureTargetDir(this.fs, featurePath, 'page');

      ensureDirectoryExists(this.fs, pagesDir);

      const importPath = path.join(importDirectory, componentName);
      const pageFile = `${pagesDir}/${componentName}.tsx`;
      const fileExists = this.fs.existsSync(pageFile);

      if (fileExists && !force) {
        this.logger.info(`Page file already exists: ${pageFile}`);
        this.logger.info('Use --force to overwrite');
      } else {
        const templatePath = path.join(
          this.templatesDir,
          'files',
          'client',
          'page.tsx'
        );

        if (!this.fs.existsSync(templatePath)) {
          this.logger.error(`Page template not found: ${templatePath}`);
          return;
        }

        const template = this.fs.readFileSync(templatePath, 'utf8');
        const replacements = {
          ComponentName: componentName,
          DisplayName: formatDisplayName(componentName),
        };
        const processed = this.templateUtility.processTemplate(
          template,
          replacements
        );

        this.fs.writeFileSync(pageFile, processed);
        this.logger.success(
          `${fileExists ? 'Overwrote' : 'Generated'} page file: ${pageFile}`
        );
      }

      const featureName = featurePath.split('/')[0];
      const featureDir = getFeatureDir(this.fs, featureName);
      const configPath = path.join(featureDir, `${featureName}.wasp.ts`);

      if (!this.fs.existsSync(configPath)) {
        this.logger.error(`Feature config file not found: ${configPath}`);

        return;
      }

      let configContent = this.fs.readFileSync(configPath, 'utf8');
      const configExists = hasHelperMethodCall(
        configContent,
        'addRoute',
        routeName
      );

      if (configExists && !force) {
        this.logger.info(`Route config already exists in ${configPath}`);
        this.logger.info('Use --force to overwrite');
      } else if (!configExists || force) {
        const definition = this.getDefinition(
          routeName,
          routePath,
          componentName,
          featurePath,
          auth,
          importPath
        );

        this.featureGenerator.updateFeatureConfig(featurePath, definition);
        this.logger.success(
          `${configExists ? 'Updated' : 'Added'} route config in: ${configPath}`
        );
      }

      this.logger.info(`\nRoute ${routeName} processing complete.`);
    } catch (error: any) {
      this.logger.error('Failed to generate route: ' + (error?.stack || error));
    }
  }

  /**
   * Generates a route definition for the feature configuration.
   */
  getDefinition(
    routeName: string,
    routePath: string,
    componentName: string,
    featurePath: string,
    auth = false,
    importPath: string
  ): string {
    const featureDir = getFeatureImportPath(featurePath);
    const templatePath = 'config/route.eta';

    return this.templateUtility.processTemplate(templatePath, {
      featureName: featurePath.split('/').pop() || featurePath,
      routeName,
      routePath,
      componentName,
      featureDir,
      auth: String(auth),
      importPath,
    });
  }
}
