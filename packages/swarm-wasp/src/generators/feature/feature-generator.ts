import {
  ExtendedSchema,
  FileSystem,
  handleFatalError,
  Logger,
  logger as singletonLogger,
  validateFeaturePath,
} from '@ingenyus/swarm';
import path from 'node:path';
import {
  findWaspRoot,
  normaliseFeaturePath,
  realFileSystem,
} from '../../common';
import { WaspGeneratorBase } from '../base/wasp-generator.base';
import { FeatureArgs, schema } from './schema';

export class FeatureGenerator extends WaspGeneratorBase<FeatureArgs> {
  name: string;
  description: string;
  schema: ExtendedSchema;

  constructor(
    public logger: Logger = singletonLogger,
    public fileSystem: FileSystem = realFileSystem
  ) {
    super(fileSystem, logger);
    this.name = 'feature';
    this.description = 'Generate feature directory structure';
    this.schema = schema;
  }

  protected getDefaultTemplatePath(templateName: string): string {
    return this.templateUtility.resolveTemplatePath(
      templateName,
      this.name,
      import.meta.url
    );
  }

  /**
   * Generate feature directory structure (main entry point)
   * @param target - The target directory to create the feature in
   */
  async generate(args: FeatureArgs): Promise<void> {
    const { target } = args;
    const segments = validateFeaturePath(target);
    const normalisedPath = normaliseFeaturePath(target);
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
