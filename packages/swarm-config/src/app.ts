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
  DbConfig,
  EmailSenderConfig,
  JobConfig,
  QueryConfig,
  RouteConfig,
  App as WaspApp,
} from 'wasp-config';

// Type definitions for helper method options
export interface RouteOptions {
  path: string;
  auth?: boolean;
}

export interface ApiOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  route: string;
  customMiddleware?: boolean;
  entities?: string[];
  auth?: boolean;
}

export interface CrudOperationOptions {
  entities?: string[];
  isPublic?: boolean;
  override?: boolean;
}

export interface CrudOptions {
  entity: string;
  getAll?: CrudOperationOptions;
  get?: CrudOperationOptions;
  create?: CrudOperationOptions;
  update?: CrudOperationOptions;
  delete?: CrudOperationOptions;
}

export interface OperationOptions {
  entities?: string[];
  auth?: boolean;
}

export interface JobOptions {
  entities?: string[];
  cron: string;
  args?: Record<string, unknown>;
}

export interface ApiNamespaceOptions {
  path: string;
}

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
   * @param featureName The name of the feature
   * @param name Route name, e.g. "DashboardRoute"
   * @param options Route configuration options
   */
  public addRoute(
    featureName: string,
    name: string,
    options: RouteOptions
  ): this {
    const componentName = name.charAt(0).toUpperCase() + name.slice(1);
    const importPath = this.getFeatureImportPath(
      featureName,
      'client',
      'pages',
      componentName
    );
    const routeConfig = {
      path: options.path,
      to: this.page(componentName, {
        authRequired: options.auth || false,
        component: {
          import: componentName,
          from: `@src/${importPath}`,
        },
      }),
    };

    super.route(name, routeConfig);

    return this;
  }

  /**
   * Helper method to add API endpoints with simplified parameters
   * @param featureName The name of the feature
   * @param name API endpoint name, e.g. "getTasksApi"
   * @param options API configuration options
   */
  public addApi(featureName: string, name: string, options: ApiOptions): this {
    const importPath = this.getFeatureImportPath(
      featureName,
      'server',
      'apis',
      name
    );
    const middlewareImportPath = this.getFeatureImportPath(
      featureName,
      'server',
      'middleware',
      name
    );

    super.api(name, {
      fn: {
        import: name,
        from: `@src/${importPath}`,
      },
      ...(options.customMiddleware && {
        import: name,
        from: `@src/${middlewareImportPath}`,
      }),
      entities: options.entities,
      httpRoute: { method: options.method, route: options.route },
      auth: options.auth || false,
    });

    return this;
  }

  /**
   * Helper method to add CRUD operations with simplified parameters
   * @param featureName The name of the feature
   * @param name The CRUD name
   * @param options CRUD configuration options
   */
  public addCrud(
    featureName: string,
    name: string,
    options: CrudOptions
  ): this {
    const processOperationOptions = (
      operationName: string,
      operationOptions?: CrudOperationOptions
    ) => {
      if (!operationOptions) return undefined;

      const processedOptions: any = { ...operationOptions };

      if (operationOptions.override) {
        const operationDataType =
          operationName === 'getAll'
            ? this.getPlural(options.entity)
            : options.entity;
        const operationComponent = `${operationName}${operationDataType}`;
        const importPath = this.getFeatureImportPath(
          featureName,
          'server',
          'cruds',
          name.charAt(0).toLowerCase() + name.slice(1)
        );

        processedOptions.overrideFn = {
          import: operationComponent,
          from: `@src/${importPath}`,
        };
        delete processedOptions.override;
      }

      return processedOptions;
    };

    super.crud(this.getPlural(options.entity), {
      entity: options.entity,
      operations: {
        getAll: processOperationOptions('getAll', options.getAll),
        get: processOperationOptions('get', options.get),
        create: processOperationOptions('create', options.create),
        update: processOperationOptions('update', options.update),
        delete: processOperationOptions('delete', options.delete),
      },
    });

    return this;
  }

  /**
   * Helper method to add actions with simplified parameters
   * @param featureName The name of the feature
   * @param name The action name
   * @param options Action configuration options
   */
  public addAction(
    featureName: string,
    name: string,
    options: OperationOptions
  ): this {
    const importPath = this.getFeatureImportPath(
      featureName,
      'server',
      'actions',
      name
    );
    const config = this.getOperationConfig(
      name,
      importPath,
      options.entities,
      options.auth
    );

    super.action(name, config);

    return this;
  }

  /**
   * Helper method to add queries with simplified parameters
   * @param featureName The name of the feature
   * @param name The query name
   * @param options Query configuration options
   */
  public addQuery(
    featureName: string,
    name: string,
    options: OperationOptions
  ): this {
    const importPath = this.getFeatureImportPath(
      featureName,
      'server',
      'queries',
      name
    );
    const config = this.getOperationConfig(
      name,
      importPath,
      options.entities,
      options.auth
    );

    super.query(name, config);

    return this;
  }

  /**
   * Helper method to add background jobs with simplified parameters
   * @param featureName The name of the feature
   * @param name Job name
   * @param options Job configuration options
   */
  public addJob(featureName: string, name: string, options: JobOptions): this {
    const importPath = this.getFeatureImportPath(
      featureName,
      'server',
      'jobs',
      name
    );

    super.job(name, {
      executor: 'PgBoss',
      perform: {
        fn: {
          import: name,
          from: `@src/${importPath}`,
        },
      },
      entities: options.entities,
      ...(options.cron && {
        schedule: {
          cron: options.cron,
          args: options.args || {},
        },
      }),
    });

    return this;
  }

  /**
   * Helper method to add API namespaces with simplified parameters
   * @param featureName The name of the feature
   * @param name Namespace name
   * @param options API namespace configuration options
   */
  public addApiNamespace(
    featureName: string,
    name: string,
    options: ApiNamespaceOptions
  ): this {
    const importPath = this.getFeatureImportPath(
      featureName,
      'server',
      'middleware',
      name
    );

    super.apiNamespace(name, {
      path: options.path,
      middlewareConfigFn: {
        import: name,
        from: `@src/${importPath}`,
      },
    });

    return this;
  }

  /**
   * Calculates the import path for a feature component
   * @param featureName The name of the feature
   * @param type The type of component (client, server, etc.)
   * @param subPath The sub-path within the feature directory
   * @param fileName The name of the file (optional, defaults to featureName)
   * @returns The calculated import path
   */
  private getFeatureImportPath(
    featureName: string,
    type: 'client' | 'server',
    subPath: string,
    fileName?: string
  ): string {
    const file = fileName || featureName;

    return `features/${featureName}/${type}/${subPath}/${file}`;
  }

  /**
   * Converts a singular word to its plural form
   * @param word The singular word to pluralize
   * @returns The plural form of the word
   */
  private getPlural(word: string): string {
    if (word.endsWith('y')) {
      return word.slice(0, -1) + 'ies';
    } else if (
      word.endsWith('s') ||
      word.endsWith('sh') ||
      word.endsWith('ch') ||
      word.endsWith('x') ||
      word.endsWith('z')
    ) {
      return word + 'es';
    } else {
      return word + 's';
    }
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
        const featureName = path.dirname(file);
        const modulePath = path.join(
          process.cwd(),
          '.wasp',
          'src',
          'features',
          file.replace('.ts', '.js')
        );
        const module = await import(modulePath);

        if (module.default) {
          module.default(this, featureName);
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
