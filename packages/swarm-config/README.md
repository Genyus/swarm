# @ingenyus/swarm-config

Enhanced Wasp configuration with Swarm-specific functionality and simplified helper methods.

## Overview

`@ingenyus/swarm-config` extends the default Wasp `App` class with additional functionality designed to make Wasp application configuration more intuitive and maintainable. It provides chainable helper methods, feature-based configuration, and simplified API for common Wasp operations.

## Installation

```bash
npm install @ingenyus/swarm-config
```

**Note:** This package uses `wasp-config` as a peer dependency. Since `wasp-config` is included with all Wasp projects, no additional installation is needed. The package automatically resolves to the real `wasp-config` when installed in a Wasp project, and uses a development stub during local development and testing.

## Quick Start

```typescript
import { App } from '@ingenyus/swarm-config';
import { AppConfig } from 'wasp-config';

const config: AppConfig = {
  app: {
    title: 'My Wasp App',
  },
};

// Create a new app instance
const app = new App('MyApp', config);

// Or use the static factory method for automatic feature loading
const app = await App.create('MyApp', config);
```

## Features

### Chainable Configuration Methods

All configuration methods return the app instance, allowing for fluent chaining:

```typescript
app
  .withFeature('dashboard', true)
  .withFeature('analytics', false)
  .withConfig('apiUrl', 'https://api.example.com')
  .withEnvironment('production')
  .auth({ method: 'EmailAndPassword' })
  .client({ rootComponent: 'Main' })
  .db({ system: 'PostgreSQL' });
```

### Feature Management

Enable or disable features dynamically:

```typescript
// Enable/disable features
app.withFeature('dashboard', true);
app.withFeature('analytics', false);

// Check if a feature is enabled
if (app.isFeatureEnabled('dashboard')) {
  // Dashboard-specific configuration
}
```

### Configuration Management

Set and retrieve configuration values:

```typescript
// Set configuration values
app.withConfig('apiUrl', 'https://api.example.com');
app.withConfig('timeout', 5000);

// Get configuration values
const apiUrl = app.getConfigValue('apiUrl');
const timeout = app.getConfigValue('timeout', 3000); // with default value
```

### Environment Management

Set the current environment:

```typescript
app.withEnvironment('production');

// Get current environment
const env = app.getConfig().environment; // 'production'
```

### Simplified Helper Methods

#### Routes

```typescript
app.addRoute(
  'DashboardRoute',           // Route name
  '/dashboard',               // Route path
  'Dashboard',                // Component name
  'features/dashboard/client/pages/Dashboard', // Import path
  true                        // Require authentication
);
```

#### API Endpoints

```typescript
app.addApi(
  'getTasksApi',              // API name
  'GET',                      // HTTP method
  '/api/tasks',               // Route path
  'features/tasks/server/api/getTasks', // Import path
  ['Task'],                   // Entities
  true                        // Require authentication
);
```

#### CRUD Operations

```typescript
app.addCrud(
  'TaskCrud',                 // CRUD name
  'Task',                     // Entity name
  { entities: ['Task'] },     // getAll options
  { entities: ['Task'] },     // get options
  { entities: ['Task'] },     // create options
  { entities: ['Task'] },     // update options
  { entities: ['Task'] }      // delete options
);
```

#### Actions and Queries

```typescript
// Add an action
app.addAction(
  'createTask',               // Action name
  'features/tasks/server/actions/createTask', // Import path
  ['Task'],                   // Entities
  true                        // Require authentication
);

// Add a query
app.addQuery(
  'getTasks',                 // Query name
  'features/tasks/server/queries/getTasks', // Import path
  ['Task'],                   // Entities
  true                        // Require authentication
);
```

#### Background Jobs

```typescript
app.addJob(
  'processTasks',             // Job name
  'features/tasks/server/jobs/processTasks', // Import path
  ['Task'],                   // Entities
  '0 0 * * *',                // Cron schedule
  '{"arg1": "value1"}'        // Schedule arguments (JSON string)
);
```

#### API Namespaces

```typescript
app.addApiNamespace(
  'tasksNamespace',           // Namespace name
  '/api/tasks',               // Namespace path
  'features/tasks/server/middleware/tasksMiddleware' // Import path
);
```

### Dynamic Feature Loading

The `App.create()` method automatically loads feature configurations from your project's `src/features` directory:

```typescript
// This will automatically load all .wasp.ts files from src/features/
const app = await App.create('MyApp', config);
```

Feature files should export a default function that receives the app instance:

```typescript
// src/features/dashboard/dashboard.wasp.ts
export default (app: App) => {
  app
    .withFeature('dashboard', true)
    .addRoute('DashboardRoute', '/dashboard', 'Dashboard', 'features/dashboard/client/pages/Dashboard')
    .addApi('getDashboardData', 'GET', '/api/dashboard', 'features/dashboard/server/api/getDashboardData');
};
```

## API Reference

### App Class

#### Constructor

```typescript
new App(name: string, config: AppConfig)
```

Creates a new App instance with the specified name and configuration.

#### Static Methods

##### `App.create(name: string, config: AppConfig): Promise<App>`

Creates and initializes an App instance with automatic feature loading.

#### Instance Methods

##### Configuration Methods

- `withFeature(featureName: string, enabled: boolean): this`
- `withConfig(key: string, value: any): this`
- `withEnvironment(env: string): this`
- `withDefaults(): this`

##### Query Methods

- `isFeatureEnabled(featureName: string): boolean`
- `getConfigValue(key: string, defaultValue?: any): any`
- `getConfig(): { features: Map<string, boolean>; config: Map<string, any>; environment: string }`

##### Helper Methods

- `addRoute(name: string, path: string, componentName: string, importPath: string, auth?: boolean): this`
- `addApi(name: string, method: string, route: string, importPath: string, entities?: string[], auth?: boolean): this`
- `addCrud(name: string, entity: string, getAllOptions?: CrudOperationOptions, getOptions?: CrudOperationOptions, createOptions?: CrudOperationOptions, updateOptions?: CrudOperationOptions, deleteOptions?: CrudOperationOptions): this`
- `addAction(name: string, importPath: string, entities?: string[], auth?: boolean): this`
- `addQuery(name: string, importPath: string, entities?: string[], auth?: boolean): this`
- `addJob(name: string, importPath: string, entities?: string[], cron?: string, scheduleArgs?: string): this`
- `addApiNamespace(name: string, path: string, importPath: string): this`

##### Feature Management

- `configureFeatures(): Promise<this>`

## Requirements

- Node.js >= 18.0.0
- Wasp >= 0.15.0
- TypeScript (recommended)

## License

MIT

## Contributing

Contributions are welcome! Please see our [contributing guidelines](../../CONTRIBUTING.md) for details.

## Support

For support and questions, please open an issue on [GitHub](https://github.com/genyus/swarm/issues).
