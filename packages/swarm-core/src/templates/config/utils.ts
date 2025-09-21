import fs from "node:fs";
import path from "node:path";
import {
  ActionConfig,
  ApiConfig,
  ApiNamespaceConfig,
  App,
  AppConfig,
  CrudConfig,
  JobConfig,
  QueryConfig,
  RouteConfig,
} from "wasp-config";

/**
 * Configuration type for a feature module containing all possible Wasp configurations
 */
export interface FeatureConfig {
  actions?: Record<string, ActionConfig>;
  apiNamespaces?: Record<string, ApiNamespaceConfig>;
  apis?: Record<string, ApiConfig>;
  cruds?: Record<string, CrudConfig>;
  jobs?: Record<string, JobConfig>;
  queries?: Record<string, QueryConfig>;
  routes?: Record<string, RouteConfig>;
}

/**
 * Configures a feature module by registering all its components with the Wasp application
 * @param app - The Wasp application instance
 * @param config - Configuration object containing routes, queries, actions, jobs and APIs
 */
function configureFeature(app: App, config: FeatureConfig): void {
  config.routes &&
    Object.entries(config.routes).forEach(([name, routeConfig]) => {
      app.route(name, routeConfig);
    });
  config.queries &&
    Object.entries(config.queries).forEach(([name, queryConfig]) => {
      app.query(name, queryConfig);
    });
  config.actions &&
    Object.entries(config.actions).forEach(([name, actionConfig]) => {
      app.action(name, actionConfig);
    });
  config.jobs &&
    Object.entries(config.jobs).forEach(([name, jobConfig]) => {
      app.job(name, jobConfig);
    });
  config.apis &&
    Object.entries(config.apis).forEach(([name, apiConfig]) => {
      app.api(name, apiConfig);
    });
  config.apiNamespaces &&
    Object.entries(config.apiNamespaces).forEach(
      ([name, apiNamespaceConfig]) => {
        app.apiNamespace(name, apiNamespaceConfig);
      },
    );
  config.cruds &&
    Object.entries(config.cruds).forEach(([name, crudConfig]) => {
      app.crud(name, crudConfig);
    });
}

/**
 * Initialises the Wasp application and loads all feature configurations
 * @param appName - The name of the application
 * @param appConfig - The configuration for the application
 * @returns The initialised Wasp application
 */
export async function initialiseApp(
  appName: string,
  appConfig: AppConfig,
): Promise<App> {
  const app = new App(appName, appConfig);
  const featureFiles = fs
    .readdirSync(path.join(process.cwd(), "config"))
    .filter((file) => file.endsWith(".wasp.ts"));

  for (const file of featureFiles) {
    try {
      const modulePath = `./${file.replace(".ts", ".js")}`;
      const module = await import(modulePath);

      if (module.default) {
        configureFeature(app, module.default(app));
      }
    } catch (error) {
      console.error(`Failed to load feature module ${file}:`, error);
    }
  }

  return app;
}
