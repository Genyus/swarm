import {
  toFriendlyName,
  toKebabCase,
  toPascalCase,
} from '../../common/strings';
import { FileSystem } from '../../types/filesystem';

interface ReplacementContext {
  projectName: string;
  friendlyName: string;
  pascalName: string;
  kebabName: string;
}

export class PlaceholderReplacer {
  constructor(private fileSystem: FileSystem) {}

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
