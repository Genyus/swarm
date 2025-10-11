import {
  ExtendedSchema,
  handleFatalError,
  IFileSystem,
  Logger,
  SignaleLogger,
  validateFeaturePath,
} from '@ingenyus/swarm-core';
import path from 'node:path';
import { BaseWaspGenerator } from '../../base-classes/base-wasp-generator';
import {
  findWaspRoot,
  normaliseFeaturePath,
  realFileSystem,
} from '../../utils/filesystem';
import { schema, SchemaArgs } from './schema';

export class FeatureDirectoryGenerator extends BaseWaspGenerator<string> {
  name: string;
  description: string;
  schema: ExtendedSchema;

  constructor(
    public logger: Logger = new SignaleLogger(),
    public fileSystem: IFileSystem = realFileSystem
  ) {
    super(fileSystem, logger);
    this.name = 'feature-directory';
    this.description = 'Generate feature directory structure';
    this.schema = schema;
  }

  protected getTemplatePath(templateName: string): string {
    return this.templateUtility.resolveTemplatePath(
      templateName,
      this.name,
      import.meta.url
    );
  }

  /**
   * Generate feature directory structure (main entry point)
   * @param featurePath - The path to the feature
   */
  async generate(flags: SchemaArgs): Promise<void> {
    const { path: featurePath } = flags;
    console.log('generate feature directory:', featurePath);
    const segments = validateFeaturePath(featurePath);
    const normalisedPath = normaliseFeaturePath(featurePath);
    const sourceRoot = path.join(findWaspRoot(this.fileSystem), 'src');

    if (segments.length > 1) {
      const parentPath = segments.slice(0, -1).join('/');
      const parentNormalisedPath = normaliseFeaturePath(parentPath);
      const parentFeatureDir = path.join(sourceRoot, parentNormalisedPath);

      if (!this.fileSystem.existsSync(parentFeatureDir)) {
        handleFatalError(
          `Parent feature '${parentPath}' does not exist. Please create it first.`
        );
      }
    }

    // Create the feature directory structure
    const featureDir = path.join(sourceRoot, normalisedPath);

    this.fileSystem.mkdirSync(featureDir, { recursive: true });
    this.configGenerator.generate(normalisedPath);
    this.logger.success(`Generated feature: ${normalisedPath}`);
  }
}
