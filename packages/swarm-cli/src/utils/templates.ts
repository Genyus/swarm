import path from 'path';
import type { IFileSystem } from '../types/filesystem';
import { getTemplatesDir } from './filesystem';
import { getPlural } from './strings';

export class TemplateUtility {
  constructor(private fileSystem: IFileSystem) {}

  processTemplate(
    template: string,
    replacements: Record<string, string>
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  getFileTemplatePath(type: string, operation?: string): string {
    const clientTypes = ['component', 'hook', 'layout', 'page', 'util'];
    const serverTypes = [
      'action',
      'api',
      'crud',
      'endpoint',
      'job',
      'middleware',
      'query',
      'route',
    ];
    const templatesDir = getTemplatesDir(this.fileSystem);

    if (clientTypes.includes(type)) {
      return path.join(templatesDir, 'files', 'client', `${type}.tsx`);
    } else if (serverTypes.includes(type)) {
      const templatePath = path.join(templatesDir, 'files', 'server');

      if ((type === 'query' || type === 'action') && operation) {
        return path.join(templatePath, getPlural(type), `${operation}.ts`);
      }

      return path.join(templatePath, `${type}.ts`);
    } else if (type === 'type') {
      return path.join(templatesDir, 'type.ts');
    }
    throw new Error(`Unknown file type: ${type}`);
  }

  getConfigTemplatePath(type: string): string {
    const templatePath = path.join(
      getTemplatesDir(this.fileSystem),
      'config',
      `${type}.ts`
    );

    return templatePath;
  }
}
