import path from 'path';
import { RouteFlags } from '../types';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import {
  ensureDirectoryExists,
  getFeatureTargetDir,
  getRouteNameFromPath,
  getTemplatesDir,
} from '../utils/filesystem';
import { formatDisplayName } from '../utils/strings';
import { processTemplate } from '../utils/templates';

export class RouteGenerator implements NodeGenerator<RouteFlags> {
  private templatesDir: string;

  constructor(
    public logger: Logger,
    public fs: IFileSystem,
    private featureGenerator: IFeatureGenerator
  ) {
    this.templatesDir = getTemplatesDir(this.fs);
  }

  async generate(featurePath: string, flags: RouteFlags): Promise<void> {
    try {
      const { path: routePath, name, auth, force } = flags;
      // Generate component name from path if not provided
      const componentName = name || getRouteNameFromPath(routePath);
      const routeName = `${
        componentName.endsWith('Page')
          ? componentName.slice(0, -4)
          : componentName
      }Route`;
      // Get the appropriate directory for the page component
      const { targetDir: pagesDir, importPath } = getFeatureTargetDir(
        this.fs,
        featurePath,
        'page'
      );
      ensureDirectoryExists(this.fs, pagesDir);
      const pageFile = `${pagesDir}/${componentName}.tsx`;
      const fileExists = this.fs.existsSync(pageFile);
      if (fileExists && !force) {
        this.logger.info(`Page file already exists: ${pageFile}`);
        this.logger.info('Use --force to overwrite');
      } else {
        // Generate the page component
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
        const processed = processTemplate(template, replacements);
        this.fs.writeFileSync(pageFile, processed);
        this.logger.success(
          `${fileExists ? 'Overwrote' : 'Generated'} page file: ${pageFile}`
        );
      }
      const configPath = `config/${featurePath.split('/')[0]}.wasp.ts`;
      if (!this.fs.existsSync(configPath)) {
        this.logger.error(`Feature config file not found: ${configPath}`);
        return;
      }
      let configContent = this.fs.readFileSync(configPath, 'utf8');
      // Look for the route definition in the format "pageName: {"
      const configExists = configContent.includes(`${componentName}: {`);
      if (configExists && !force) {
        this.logger.info(`Route config already exists in ${configPath}`);
        this.logger.info('Use --force to overwrite');
      } else if (!configExists || force) {
        if (configExists && force) {
          // Remove existing route definition including the closing brace on its own line
          const regex = new RegExp(
            `\\s*${componentName}:\\s*{[^}]*}\\s*[,]?[^}]*}[,]?(?:\\r?\\n)`,
            'g'
          );
          configContent = configContent.replace(regex, '\n');
          // Clean up any double newlines that might have been left behind
          configContent = configContent.replace(/\n\s*\n\s*\n/g, '\n\n');
          this.fs.writeFileSync(configPath, configContent);
        }
        // Update feature config with new route
        this.featureGenerator.updateFeatureConfig(featurePath, 'route', {
          path: routePath,
          componentName,
          routeName,
          importPath,
          auth,
        });
        this.logger.success(
          `${configExists ? 'Updated' : 'Added'} route config in: ${configPath}`
        );
      }
      this.logger.info(`\nRoute ${routeName} processing complete.`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.logger.error('Failed to generate route: ' + error.stack);
    }
  }
}
