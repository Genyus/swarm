import path from 'node:path';
import { IntegrationTestEnvironment } from './setup.js';

export interface FileStructure {
  [key: string]: string | FileStructure;
}

export class IntegrationValidator {
  constructor(private testEnv: IntegrationTestEnvironment) {}

  async validateFileStructure(expected: FileStructure): Promise<void> {
    await this.validateStructureRecursive(expected, '');
  }

  private async validateStructureRecursive(
    structure: FileStructure,
    basePath: string
  ): Promise<void> {
    for (const [name, content] of Object.entries(structure)) {
      const fullPath = path.join(basePath, name);

      if (typeof content === 'string') {
        const exists = await this.testEnv.fileExists(fullPath);

        if (!exists) {
          throw new Error(`Expected file not found: ${fullPath}`);
        }
      } else {
        const exists = await this.testEnv.fileExists(fullPath);

        if (!exists) {
          throw new Error(`Expected directory not found: ${fullPath}`);
        }

        await this.validateStructureRecursive(content, fullPath);
      }
    }
  }

  async validateGeneratedCode(component: string): Promise<void> {
    const componentPath = await this.findComponentPath(component);

    if (!componentPath) {
      throw new Error(`Component path not found for: ${component}`);
    }

    const content = await this.testEnv.readFile(componentPath);

    if (content.includes('TODO') || content.includes('FIXME')) {
      throw new Error(`Generated code contains TODO/FIXME: ${componentPath}`);
    }
  }

  private async findComponentPath(component: string): Promise<string | null> {
    const commonPaths = [
      `src/features/${component}/${component}.tsx`,
      `src/features/${component}/index.tsx`,
      `src/api/${component.toLowerCase()}.ts`,
      `src/operations/${component.toLowerCase()}.ts`,
      `src/routes/${component.toLowerCase()}.tsx`,
    ];

    for (const path of commonPaths) {
      if (await this.testEnv.fileExists(path)) {
        return path;
      }
    }

    return null;
  }

  async validateProjectCompilation(): Promise<boolean> {
    try {
      const packageJson = await this.testEnv.readFile('package.json');
      const packageData = JSON.parse(packageJson);

      if (
        !packageData.name ||
        !packageData.version ||
        !packageData.type ||
        packageData.type !== 'module'
      ) {
        return false;
      }

      const mainWasp = await this.testEnv.readFile('main.wasp.ts');

      if (
        !mainWasp.includes('import { App }') ||
        !mainWasp.includes('new App(') ||
        !mainWasp.includes('export default app')
      ) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  async validateIntegrationPoints(): Promise<void> {
    const mainWasp = await this.testEnv.readFile('main.wasp.ts');

    if (mainWasp.includes('app.entity(') && !mainWasp.includes('relations:')) {
      throw new Error('Entities found but no relationships defined');
    }

    if (mainWasp.includes('app.api(') && !mainWasp.includes('app.route(')) {
      throw new Error('APIs found but no routes defined');
    }
  }

  async validateRollbackFunctionality(): Promise<void> {
    const backupExists = await this.testEnv.fileExists('.mcp_backups');

    if (!backupExists) {
      throw new Error('Backup directory not created');
    }

    const backupFiles = await this.testEnv.listFiles('.mcp_backups');

    if (backupFiles.length === 0) {
      throw new Error('No backup files found');
    }
  }

  async validateFileContent(
    filePath: string,
    expectedContent: string | RegExp
  ): Promise<void> {
    const content = await this.testEnv.readFile(filePath);

    if (typeof expectedContent === 'string') {
      if (!content.includes(expectedContent)) {
        throw new Error(
          `Expected content not found in ${filePath}: ${expectedContent}`
        );
      }
    } else {
      if (!expectedContent.test(content)) {
        throw new Error(
          `Expected pattern not found in ${filePath}: ${expectedContent}`
        );
      }
    }
  }

  async validateDirectoryStructure(
    dirPath: string,
    expectedFiles: string[]
  ): Promise<void> {
    const files = await this.testEnv.listFiles(dirPath);

    for (const expectedFile of expectedFiles) {
      if (!files.includes(expectedFile)) {
        throw new Error(
          `Expected file not found in ${dirPath}: ${expectedFile}`
        );
      }
    }
  }
}
