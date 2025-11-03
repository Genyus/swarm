import { handleFatalError, Out, validateFeaturePath } from '@ingenyus/swarm';
import path from 'node:path';
import { findWaspRoot, normaliseFeaturePath } from '../../common';
import { WaspGeneratorBase } from '../base/wasp-generator.base';
import { schema } from './schema';

export class FeatureGenerator extends WaspGeneratorBase<typeof schema> {
  name: string;
  description: string;
  schema = schema;

  constructor() {
    super();
    this.name = 'feature';
    this.description =
      'Generates a feature directory containing a Wasp configuration file';
  }

  protected getDefaultTemplatePath(templateName: string): string {
    return this.templateUtility.resolveTemplatePath(
      templateName,
      this.name,
      import.meta.url
    );
  }

  /**
   * Generates a feature directory containing a Wasp configuration file
   * @param target - The target path of the generated directory
   */
  async generate(args: Out<typeof schema>): Promise<void> {
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
