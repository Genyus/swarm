import fs, { Dirent, PathLike } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppConfig } from 'wasp-config';
import { App } from '../src/app.js';

// Mock wasp-config
vi.mock('wasp-config', () => {
  const mockApp = class MockWaspApp {
    name: string;
    config: AppConfig;

    constructor(name: string, config: AppConfig) {
      this.name = name;
      this.config = config;
    }

    auth() {
      return this;
    }
    client() {
      return this;
    }
    db() {
      return this;
    }
    emailSender() {
      return this;
    }
    job() {
      return this;
    }
    query() {
      return this;
    }
    route() {
      return this;
    }
    api() {
      return this;
    }
    apiNamespace() {
      return this;
    }
    crud() {
      return this;
    }
    action() {
      return this;
    }
    page() {
      return { authRequired: false, component: {} };
    }
  };

  return {
    App: mockApp,
    WaspApp: mockApp,
    ActionConfig: {},
    ApiConfig: {},
    ApiNamespaceConfig: {},
    AppConfig: {},
    AuthConfig: {},
    ClientConfig: {},
    CrudConfig: {},
    CrudOperationOptions: {},
    DbConfig: {},
    EmailSenderConfig: {},
    JobConfig: {},
    QueryConfig: {},
    RouteConfig: {},
  };
});

// Mock fs
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
  },
}));

// Mock path
vi.mock('node:path', () => ({
  default: {
    join: (...args: string[]) => args.join('/'),
    relative: (from: string, to: string) => to.replace(from, ''),
    basename: (path: string) => path.split('/').pop() || '',
    dirname: (path: string) => path.split('/').slice(0, -1).join('/'),
  },
}));

const mockFs = vi.mocked(fs);

describe('App', () => {
  let app: App;
  let mockConfig: AppConfig;

  beforeEach(() => {
    mockConfig = {
      app: {
        title: 'Test App',
      },
    };
    app = new App('TestApp', mockConfig);
  });

  describe('Constructor', () => {
    it('should create an App instance', () => {
      expect(app).toBeInstanceOf(App);
    });
  });

  describe('Static create method', () => {
    it('should create and initialize an App instance', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const createdApp = await App.create('TestApp', mockConfig);

      expect(createdApp).toBeInstanceOf(App);
    });
  });

  describe('Chainable configuration methods', () => {
    it('should return this for all chainable methods', () => {
      const authConfig = { method: 'EmailAndPassword' };
      const clientConfig = { rootComponent: 'Main' };
      const dbConfig = { system: 'PostgreSQL' };

      expect(app.auth(authConfig)).toBe(app);
      expect(app.client(clientConfig)).toBe(app);
      expect(app.db(dbConfig)).toBe(app);
    });
  });

  describe('Helper methods', () => {
    it('should add routes with simplified parameters', () => {
      const result = app.addRoute(
        'DashboardRoute',
        '/dashboard',
        'Dashboard',
        'features/dashboard/client/pages/Dashboard',
        true
      );

      expect(result).toBe(app);
    });

    it('should add API endpoints with simplified parameters', () => {
      const result = app.addApi(
        'getTasksApi',
        'GET',
        '/api/tasks',
        'features/dashboard/server/api/getTasks',
        ['Task'],
        true
      );

      expect(result).toBe(app);
    });

    it('should add CRUD operations with simplified parameters', () => {
      const result = app.addCrud(
        'TaskCrud',
        'Task',
        { entities: ['Task'] },
        { entities: ['Task'] },
        { entities: ['Task'] },
        { entities: ['Task'] },
        { entities: ['Task'] }
      );

      expect(result).toBe(app);
    });

    it('should add actions with simplified parameters', () => {
      const result = app.addAction(
        'createTask',
        'features/tasks/server/actions/createTask',
        ['Task'],
        true
      );

      expect(result).toBe(app);
    });

    it('should add queries with simplified parameters', () => {
      const result = app.addQuery(
        'getTasks',
        'features/tasks/server/queries/getTasks',
        ['Task'],
        true
      );

      expect(result).toBe(app);
    });

    it('should add jobs with simplified parameters', () => {
      const result = app.addJob(
        'processTasks',
        'features/tasks/server/jobs/processTasks',
        ['Task'],
        '0 0 * * *',
        '{"arg1": "value1"}'
      );

      expect(result).toBe(app);
    });

    it('should add API namespaces with simplified parameters', () => {
      const result = app.addApiNamespace(
        'tasksNamespace',
        '/api/tasks',
        'features/tasks/server/middleware/tasksMiddleware'
      );

      expect(result).toBe(app);
    });
  });

  describe('Feature configuration', () => {
    it('should configure features from directory', async () => {
      mockFs.existsSync.mockReturnValue(true);

      // Mock readdirSync to return different results based on the directory
      mockFs.readdirSync.mockImplementation((path: PathLike) => {
        if (path.toString().includes('features')) {
          // Root features directory
          return [
            {
              name: 'auth.wasp.ts',
              isDirectory: () => false,
              isFile: () => true,
              isBlockDevice: () => false,
              isCharacterDevice: () => false,
              isSymbolicLink: () => false,
              isFIFO: () => false,
              isSocket: () => false,
            },
          ] as unknown as Dirent<Buffer>[];
        } else {
          // Subdirectories return empty to prevent infinite recursion
          return [] as Dirent<Buffer>[];
        }
      });

      // Mock the feature module
      const mockFeatureModule = {
        default: vi.fn(),
      };
      vi.doMock('../features/auth.wasp.js', () => mockFeatureModule);

      const result = await app.configureFeatures();
      expect(result).toBe(app);
    });

    it('should handle missing features directory gracefully', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = await app.configureFeatures();
      expect(result).toBe(app);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid JSON in scheduleArgs', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      app.addJob('testJob', 'test/path', [], '0 0 * * *', 'invalid json');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid scheduleArgs JSON: invalid json'
      );
      consoleSpy.mockRestore();
    });
  });
});
