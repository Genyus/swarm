import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export interface ProjectTemplate {
  name: string;
  files: Record<string, string>;
  dependencies?: string[];
}

export interface FileStructure {
  [key: string]: string | FileStructure;
}

export class IntegrationTestEnvironment {
  private _tempProjectDir: string;
  private projectTemplates: Map<string, ProjectTemplate>;

  constructor() {
    this._tempProjectDir = '';
    this.projectTemplates = new Map();
    this.setupTemplates();
  }

  get tempProjectDir(): string {
    return this._tempProjectDir;
  }

  private setupTemplates() {
    this.projectTemplates.set('minimal', {
      name: 'minimal-app',
      files: {
        'main.wasp.ts': `import { App } from 'wasp-config'

const app = new App('minimalApp', {
  title: 'Minimal App',
  wasp: { version: '^0.17.0' }
});

export default app;`,
        'package.json': JSON.stringify(
          {
            name: 'minimal-app',
            version: '0.1.0',
            type: 'module',
            dependencies: {},
            devDependencies: {
              'wasp-config': '^0.17.0',
            },
          },
          null,
          2
        ),
        'src/.gitkeep': '',
      },
    });

    this.projectTemplates.set('withAuth', {
      name: 'auth-app',
      files: {
        'main.wasp.ts': `import { App } from 'wasp-config'

const app = new App('authApp', {
  title: 'Auth App',
  wasp: { version: '^0.17.0' }
});

app.auth({
  userEntity: 'User',
  methods: {
    usernameAndPassword: {}
  },
  onAuthFailedRedirectTo: '/login'
});

export default app;`,
        'package.json': JSON.stringify(
          {
            name: 'auth-app',
            version: '0.1.0',
            type: 'module',
            dependencies: {},
            devDependencies: {
              'wasp-config': '^0.17.0',
            },
          },
          null,
          2
        ),
        'src/.gitkeep': '',
      },
    });

    this.projectTemplates.set('withEntities', {
      name: 'entity-app',
      files: {
        'main.wasp.ts': `import { App } from 'wasp-config'

const app = new App('entityApp', {
  title: 'Entity App',
  wasp: { version: '^0.17.0' }
});

app.entity('User', {
  fields: [
    { name: 'id', type: 'Int', isId: true, default: 'autoincrement' },
    { name: 'email', type: 'String', isUnique: true },
    { name: 'name', type: 'String' }
  ]
});

app.entity('Post', {
  fields: [
    { name: 'id', type: 'Int', isId: true, default: 'autoincrement' },
    { name: 'title', type: 'String' },
    { name: 'content', type: 'String' },
    { name: 'authorId', type: 'Int' }
  ],
  relations: [
    { name: 'author', type: 'User', fields: ['authorId'], references: ['id'] }
  ]
});

export default app;`,
        'package.json': JSON.stringify(
          {
            name: 'entity-app',
            version: '0.1.0',
            type: 'module',
            dependencies: {},
            devDependencies: {
              'wasp-config': '^0.17.0',
            },
          },
          null,
          2
        ),
        'src/.gitkeep': '',
      },
    });
  }

  async setup(templateName: string = 'minimal'): Promise<string> {
    const template = this.projectTemplates.get(templateName);

    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    this._tempProjectDir = path.join(
      process.cwd(),
      'tests',
      'output',
      `test-${randomUUID()}`
    );
    await fs.promises.mkdir(this._tempProjectDir, { recursive: true });
    await this.createProjectFiles(template);
    // Don't change working directory to avoid conflicts in parallel tests

    return this._tempProjectDir;
  }

  private async createProjectFiles(template: ProjectTemplate): Promise<void> {
    for (const [filePath, content] of Object.entries(template.files)) {
      const fullPath = path.join(this._tempProjectDir, filePath);
      const dir = path.dirname(fullPath);

      if (dir !== this._tempProjectDir) {
        await fs.promises.mkdir(dir, { recursive: true });
      }

      await fs.promises.writeFile(fullPath, content, 'utf8');
    }
  }

  async teardown(): Promise<void> {
    if (this._tempProjectDir && fs.existsSync(this._tempProjectDir)) {
      await fs.promises.rm(this._tempProjectDir, {
        recursive: true,
        force: true,
      });
    }
  }

  getProjectRoot(): string {
    return this._tempProjectDir;
  }

  async addFile(relativePath: string, content: string): Promise<void> {
    const fullPath = path.join(this._tempProjectDir, relativePath);
    const dir = path.dirname(fullPath);

    if (dir !== this._tempProjectDir) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    await fs.promises.writeFile(fullPath, content, 'utf8');
  }

  async readFile(relativePath: string): Promise<string> {
    const fullPath = path.join(this._tempProjectDir, relativePath);

    return fs.promises.readFile(fullPath, 'utf8');
  }

  async deleteFile(relativePath: string): Promise<void> {
    try {
      const fullPath = path.join(this._tempProjectDir, relativePath);

      await fs.promises.unlink(fullPath);
    } catch {
      // Ignore errors if file doesn't exist
    }
  }

  async fileExists(relativePath: string): Promise<boolean> {
    const fullPath = path.join(this._tempProjectDir, relativePath);
    try {
      await fs.promises.access(fullPath);

      return true;
    } catch {
      return false;
    }
  }

  async listFiles(dir: string = '.'): Promise<string[]> {
    const fullPath = path.join(this._tempProjectDir, dir);
    try {
      const entries = await fs.promises.readdir(fullPath, {
        withFileTypes: true,
      });

      return entries.map((entry) => entry.name);
    } catch (error) {
      // Return empty array for non-existent directories
      if (error instanceof Error && error.message.includes('ENOENT')) {
        return [];
      }

      throw error;
    }
  }
}
