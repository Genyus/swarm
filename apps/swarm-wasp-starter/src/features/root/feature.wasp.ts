import { App } from "@ingenyus/swarm-wasp";

/**
 * Fluent Wasp feature configuration
 *
 * Example usage:
 * ```ts
 * app
 *   .addApi(feature, "getItems", {
 *     method: "GET", route: "/api/feature/items", entities: ["Item"], auth: true
 *   })
 *   .addApiNamespace(feature, "apiNamespace", {
 *     path: "/api/feature"
 *   })
 *   .addRoute(feature, "featureRoute", {
 *     path: "/feature", componentName: "Feature", auth: false
 *   });
 * ```
 */
export default function configureFeature(app: App, feature: string): void {
  app
    // Route definitions
    .addRoute(feature, "home", {
      path: "/",
      auth: false,
    });
}
