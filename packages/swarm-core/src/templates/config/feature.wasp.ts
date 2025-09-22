import { App } from 'swarm-config';

/**
 * Fluent Wasp feature configuration
 *
 * Example usage:
 * ```ts
 * app
 *   .addApiNamespace('apiNamespace', '/api/feature', 'features/feature/_core/server/middleware/middleware')
 *   .addApi('getItems', 'GET', '/api/items', 'features/feature/_core/server/apis/getItems', ['Item'], true)
 *   .addRoute('FeatureRoute', '/feature', 'Feature', 'features/feature/_core/client/pages/Feature', false);
 * ```
 */
export default function configure(app: App): void {
}
