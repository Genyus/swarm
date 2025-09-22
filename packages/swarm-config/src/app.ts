import fs from 'node:fs';
import path from 'node:path';

// Import types and classes from wasp-config
// In development: resolves to stub implementation via devDependency link
// In production (Wasp project): resolves to real wasp-config package
import {
  ActionConfig,
  ApiConfig,
  ApiNamespaceConfig,
  AppConfig,
  AuthConfig,
  ClientConfig,
  CrudConfig,
  CrudOperationOptions,
  DbConfig,
  EmailSenderConfig,
  JobConfig,
  QueryConfig,
  RouteConfig,
  App as WaspApp,
} from 'wasp-config';

/**
 * Enhanced Wasp App class with Swarm-specific functionality
 *
 * This class extends the default Wasp App class with:
 * - Chainable helper methods for simplified configuration
 * - Dynamic feature-based configuration loading
 * - Enhanced error handling and validation
 */
export class App extends WaspApp {
  constructor(name: string, config: AppConfig) {
    super(name, config);
  }

  /**
   * Static factory method that creates and initializes Swarm with configuration
   * dynamically loaded from feature directories
   *
   * @param name The name of the application
   * @param config The base configuration for the application
   * @returns An initialized Swarm instance
   */
  static async create(name: string, config: AppConfig): Promise<App> {
    const app = new App(name, config);

    await app.configureFeatures();

    return app;
  }

  // Chainable configuration methods
  public auth(authConfig: AuthConfig): this {
    super.auth(authConfig);

    return this;
  }

  public client(clientConfig: ClientConfig): this {
    super.client(clientConfig);

    return this;
  }

  public db(dbConfig: DbConfig): this {
    super.db(dbConfig);

    return this;
  }

  public emailSender(emailSenderConfig: EmailSenderConfig): this {
    super.emailSender(emailSenderConfig);

    return this;
  }

  public job(name: string, jobConfig: JobConfig): this {
    super.job(name, jobConfig);

    return this;
  }

  public query(name: string, queryConfig: QueryConfig): this {
    super.query(name, queryConfig);

    return this;
  }

  public route(name: string, routeConfig: RouteConfig): this {
    super.route(name, routeConfig);

    return this;
  }

  public api(name: string, apiConfig: ApiConfig): this {
    super.api(name, apiConfig);

    return this;
  }

  public apiNamespace(
    name: string,
    apiNamespaceConfig: ApiNamespaceConfig
  ): this {
    super.apiNamespace(name, apiNamespaceConfig);

    return this;
  }

  public crud(name: string, crudConfig: CrudConfig): this {
    super.crud(name, crudConfig);

    return this;
  }

  public action(name: string, actionConfig: ActionConfig): this {
    super.action(name, actionConfig);

    return this;
  }

  /**
   * Helper method to add routes with simplified parameters
   * @param name Route name, e.g. "DashboardRoute"
   * @param path Route path, e.g. "/dashboard"
   * @param componentName Custom page component name, e.g. "Dashboard"
   * @param importPath Import path (excluding `@src/` prefix), e.g. "features/dashboard/client/pages/Dashboard"
   * @param auth Require authentication (optional, defaults to false)
   */
  public addRoute(
    name: string,
    path: string,
    componentName: string,
    importPath: string,
    auth?: boolean
  ): this {
    super.route(name, {
      path,
      to: this.page(componentName, {
        authRequired: auth || false,
        component: {
          import: componentName,
          from: `@src/${importPath}`,
        },
      }),
    });

    return this;
  }

  /**
   * Helper method to add API endpoints with simplified parameters
   * @param name API endpoint name, e.g. "getTasksApi"
   * @param method HTTP method, e.g. "GET"
   * @param route API route path, e.g. "/api/tasks"
   * @param importPath Import path (excluding `@src/` prefix), e.g. "features/dashboard/server/api/getTasks"
   * @param entities Comma-separated list of entities (optional), e.g. ["Task"]
   * @param auth Require authentication (optional)
   */
  public addApi(
    name: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    route: string,
    importPath: string,
    entities?: string[],
    auth?: boolean
  ): this {
    super.api(name, {
      fn: {
        import: name,
        from: `@src/${importPath}`,
      },
      entities,
      httpRoute: { method, route },
      auth: auth || false,
    });

    return this;
  }

  /**
   * Helper method to add CRUD operations with simplified parameters
   * @param name The CRUD name
   * @param entity Entity name
   * @param getAllOptions Options for getAll operation (optional)
   * @param getOptions Options for get operation (optional)
   * @param createOptions Options for create operation (optional)
   * @param updateOptions Options for update operation (optional)
   * @param deleteOptions Options for delete operation (optional)
   */
  public addCrud(
    name: string,
    entity: string,
    getAllOptions?: CrudOperationOptions,
    getOptions?: CrudOperationOptions,
    createOptions?: CrudOperationOptions,
    updateOptions?: CrudOperationOptions,
    deleteOptions?: CrudOperationOptions
  ): this {
    super.crud(name, {
      entity,
      operations: {
        getAll: getAllOptions,
        get: getOptions,
        create: createOptions,
        update: updateOptions,
        delete: deleteOptions,
      },
    });

    return this;
  }

  /**
   * Helper method to add actions with simplified parameters
   * @param name The action name
   * @param importPath Import path (excluding `@src/` prefix), e.g. "features/dashboard/server/queries/getTasks"
   * @param entities Comma-separated list of entities (optional, defaults to datatype)
   * @param auth Require authentication (optional)
   */
  public addAction(
    name: string,
    importPath: string,
    entities?: string[],
    auth?: boolean
  ): this {
    const config = this.getOperationConfig(name, importPath, entities, auth);

    super.action(name, config);

    return this;
  }

  /**
   * Helper method to add queries with simplified parameters
   * @param name The query name
   * @param importPath Import path (excluding `@src/` prefix), e.g. "features/dashboard/server/queries/getTasks"
   * @param entities Comma-separated list of entities (optional, defaults to datatype)
   * @param auth Require authentication (optional)
   */
  public addQuery(
    name: string,
    importPath: string,
    entities?: string[],
    auth?: boolean
  ): this {
    const config = this.getOperationConfig(name, importPath, entities, auth);

    super.query(name, config);

    return this;
  }

  /**
   * Helper method to add background jobs with simplified parameters
   * @param name Job name
   * @param importPath Import path (excluding `@src/` prefix), e.g. "features/dashboard/server/jobs/getTasks"
   * @param entities Comma-separated list of entities (optional), e.g. ["Task"]
   * @param cron Cron schedule expression (optional), e.g. "0 0 * * *"
   * @param scheduleArgs JSON string of schedule arguments (optional), e.g. "{\"arg1\": \"value1\", \"arg2\": \"value2\"}"
   */
  public addJob(
    name: string,
    importPath: string,
    entities?: string[],
    cron?: string,
    scheduleArgs?: string
  ): this {
    let args = {};

    if (scheduleArgs) {
      try {
        args = JSON.parse(scheduleArgs);
      } catch {
        console.warn(`Invalid scheduleArgs JSON: ${scheduleArgs}`);
      }
    }

    super.job(name, {
      executor: 'PgBoss',
      perform: {
        fn: {
          import: name,
          from: `@src/${importPath}`,
        },
      },
      entities,
      ...(cron && {
        schedule: {
          cron,
          args,
        },
      }),
    });

    return this;
  }

  /**
   * Helper method to add API namespaces with simplified parameters
   * @param name Namespace name
   * @param path Namespace path
   * @param importPath Import path (excluding `@src/` prefix), e.g. "features/dashboard/server/middleware/tasksMiddleware"
   */
  public addApiNamespace(name: string, path: string, importPath: string): this {
    super.apiNamespace(name, {
      path,
      middlewareConfigFn: {
        import: name,
        from: `@src/${importPath}`,
      },
    });

    return this;
  }

  /**
   * Configures all feature modules by scanning the features directory
   */
  async configureFeatures(): Promise<this> {
    const featuresDir = path.join(process.cwd(), 'src', 'features');

    // Check if features directory exists
    if (!fs.existsSync(featuresDir)) {
      console.warn(
        'Features directory not found, skipping feature configuration'
      );
      return this;
    }

    const getAllFeatureFiles = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of list) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          results = results.concat(getAllFeatureFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.wasp.ts')) {
          results.push(path.relative(featuresDir, fullPath));
        }
      }
      return results;
    };

    const featureFiles = getAllFeatureFiles(featuresDir);

    for (const file of featureFiles) {
      try {
        const modulePath = `../features/${file.replace('.ts', '.js')}`;
        const module = await import(modulePath);

        if (module.default) {
          module.default(this);
        }
      } catch (error) {
        console.error(`Failed to load feature module ${file}:`, error);
      }
    }

    return this;
  }

  /**
   * Helper method to get the configuration for an action or query
   * @param name The operation name
   * @param importPath Import path (excluding `@src/` prefix), e.g. "features/dashboard/server/queries/getTasks"
   * @param entities Comma-separated list of entities (optional, defaults to datatype)
   * @param auth Require authentication (optional)
   */
  private getOperationConfig(
    name: string,
    importPath: string,
    entities?: string[],
    auth?: boolean
  ): QueryConfig | ActionConfig {
    return {
      fn: {
        import: name,
        from: `@src/${importPath}`,
      },
      entities: entities,
      auth: auth || false,
    };
  }
}
