import degit from 'degit';
import path from 'node:path';
import {
  toFriendlyName,
  toKebabCase,
  toPascalCase,
  validateProjectName,
} from '../../common/strings';
import { GeneratorBase } from '../../generator/generator.base';
import { FileSystem, realFileSystem } from '../../types/filesystem';
import { Logger, SignaleLogger } from '../../types/logger';
import { PlaceholderReplacer } from './placeholder-replacer';
import { schema, SchemaArgs } from './schema';

export class AppGenerator extends GeneratorBase<SchemaArgs> {
  name = 'create';
  description = 'Create a new Swarm-enabled project from a GitHub template';
  schema = schema;

  constructor(
    public fileSystem: FileSystem = realFileSystem,
    public logger: Logger = new SignaleLogger()
  ) {
    super(fileSystem, logger);
  }

  async generate(params: SchemaArgs): Promise<void> {
    return this.handleGeneratorError('project', params.name, async () => {
      const validation = validateProjectName(params.name);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const targetDir = params.targetDir || params.name;
      const fullPath = this.path.resolve(process.cwd(), targetDir);

      // Check if directory exists
      if (this.fileSystem.existsSync(fullPath)) {
        throw new Error(`Directory already exists: ${fullPath}`);
      }

      this.logger.info(`Creating project: ${params.name}`);
      this.logger.info(`Template: ${params.template}`);
      this.logger.info(`Target: ${fullPath}`);

      // Clone template using degit
      const emitter = degit(params.template, { cache: false, force: false });
      await emitter.clone(fullPath);

      // Prepare replacement context
      const context = {
        projectName: params.name,
        friendlyName: toFriendlyName(params.name),
        pascalName: toPascalCase(params.name),
        kebabName: toKebabCase(params.name),
      };

      // Replace placeholders in key files
      const replacer = new PlaceholderReplacer(this.fileSystem);
      const filesToUpdate = [
        this.path.join(fullPath, 'package.json'),
        this.path.join(fullPath, 'README.md'),
        this.path.join(fullPath, 'main.wasp.ts'),
      ];

      for (const file of filesToUpdate) {
        if (this.fileSystem.existsSync(file)) {
          await replacer.replaceInFile(file, context);
        }
      }

      this.logger.success(`Project created successfully at: ${fullPath}`);
      this.logger.info(`Next steps:`);
      this.logger.info(`  cd ${targetDir}`);
      this.logger.info(`  npm install`);
    });
  }
}
