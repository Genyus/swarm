import degit from 'degit';
import path from 'node:path';
import {
  FileSystem,
  realFileSystem,
  toFriendlyName,
  toKebabCase,
  toPascalCase,
  validateProjectName,
} from '../../common';
import { Logger, SignaleLogger } from '../../logger';
import { Out } from '../../schema';
import { GeneratorBase } from '../generator.base';
import { schema } from './schema';

interface ReplacementContext {
  projectName: string;
  friendlyName: string;
  pascalName: string;
  kebabName: string;
}

export class AppGenerator extends GeneratorBase<typeof schema> {
  name = 'create';
  description = 'Create a new Swarm-enabled project from a GitHub template';
  schema = schema;
  private readonly supportedExtensions = ['.json', '.ts', '.tsx'];

  constructor(
    public fileSystem: FileSystem = realFileSystem,
    public logger: Logger = new SignaleLogger()
  ) {
    super(fileSystem, logger);
  }

  async generate(args: Out<typeof schema>): Promise<void> {
    return this.handleGeneratorError('project', args.name, async () => {
      const validation = validateProjectName(args.name);

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const targetDir = args.targetDir ?? args.name;
      const fullPath = this.path.resolve(process.cwd(), targetDir);

      // Check if directory exists
      if (this.fileSystem.existsSync(fullPath)) {
        throw new Error(`Directory already exists: ${fullPath}`);
      }

      this.logger.info(`Creating project: ${args.name}`);
      this.logger.info(`Template: ${args.template}`);
      this.logger.info(`Target: ${fullPath}`);

      // Clone template using degit
      const emitter = degit(args.template, { cache: false, force: false });
      await emitter.clone(fullPath);

      // Prepare replacement context
      const context = {
        projectName: args.name,
        friendlyName: toFriendlyName(args.name),
        pascalName: toPascalCase(args.name),
        kebabName: toKebabCase(args.name),
      };

      // Replace placeholders in key files
      const filesToUpdate = await this.findFilesToReplace(fullPath);

      for (const file of filesToUpdate) {
        await this.replaceInFile(file, context);
      }

      this.logger.success(`Project created successfully at: ${fullPath}`);
      this.logger.info(`Next steps:`);
      this.logger.info(`  cd ${targetDir}`);
      this.logger.info(`  npm install`);
    });
  }

  /**
   * Recursively finds all files with supported extensions in a directory
   */
  async findFilesToReplace(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    const processDirectory = (currentPath: string): void => {
      if (!this.fileSystem.existsSync(currentPath)) {
        return;
      }

      const entries = this.fileSystem.readdirSync(currentPath, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          // Skip common directories that shouldn't be processed
          if (this.shouldSkipDirectory(entry.name)) {
            continue;
          }

          processDirectory(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);

          if (this.supportedExtensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };

    processDirectory(dirPath);

    return files;
  }

  /**
   * Determines if a directory should be skipped during file discovery
   */
  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = [
      '.idea',
      '.DS_Store',
      '.git',
      '.vscode',
      '.wasp',
      'node_modules',
      'public',
      'scripts',
    ];

    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  async replaceInFile(
    filePath: string,
    context: ReplacementContext
  ): Promise<void> {
    const content = this.fileSystem.readFileSync(filePath, 'utf-8');
    const replaced = this.replaceContent(content, context);

    this.fileSystem.writeFileSync(filePath, replaced, 'utf-8');
  }

  private replaceContent(content: string, context: ReplacementContext): string {
    return content
      .replace(/swarm-wasp-starter/g, context.kebabName)
      .replace(/Swarm Wasp Starter/g, context.friendlyName);
  }
}
