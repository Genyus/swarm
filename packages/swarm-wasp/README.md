<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Genyus/swarm/HEAD/docs/images/swarm-logo-horizontal-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Genyus/swarm/HEAD/docs/images/swarm-logo-horizontal.svg">
    <img alt="Swarm - Typescript Code Generator" src="https://raw.githubusercontent.com/Genyus/swarm/HEAD/docs/images/swarm-logo-horizontal.svg" width="350" style="max-width: 100%;">
  </picture>
</p>

# @ingenyus/swarm-wasp

A [Swarm](../swarm/README.md) plugin that provides a set of tools for accelerated [Wasp](https://wasp.sh) app development.

## Table of Contents

- [Getting Started](#getting-started)
- [Features](#features)
- [Wasp Improvements](#wasp-improvements)
- [MCP Integration](#mcp-integration)

## Getting Started

This package is part of the Swarm monorepo. See the main [README](../../README.md) for development setup instructions.

Install the plugin:

```bash
npm install @ingenyus/swarm @ingenyus/swarm-wasp
```

### Configuration

The plugin can be configured via the `swarm.config.json` file, or by the `swarm` block in `package.json` as follows:

```json
{
  "plugins": [
    {
      "import": "wasp",
      "from": "@ingenyus/swarm-wasp"
    }
  ]
}
```

To disable the plugin or any provided generators, set the `disabled` property (`false` by default) on the relevant object:

```json
{
  "plugins": [
    {
      "import": "wasp",
      "from": "@ingenyus/swarm-wasp",
      "disabled": false,
      "generators": {
        "api": {
          "disabled": true
        }
      }
    }
  ]
}
```

## Features

### Component Generators

This plugin provides generators to create feature directories and boilerplate code for all documented Wasp components (API endpoints and namespaces, CRUD operations, Actions, Queries, Routes and Jobs). Generator output is fully type-safe and compatible with your Prisma schema and all generators are exposed by the core framework as both CLI commands and MCP tools.

For complete generator documentation including MCP tool names, CLI command syntax, and all available options, see [GENERATORS.md](./docs/GENERATORS.md).

### Custom Templates

Swarm uses a templating system built on the [Eta](https://eta.js.org/) templating engine, with access to generator context variables and support for custom overrides. To override a built-in template with a custom, simply create a .eta template under `.swarm/templates/wasp` suffixed with the same templates path used internally by the generator, e.g. to override the crud template, the override would be positioned at `.swarm/templates/wasp/crud/page.eta`:

```
.swarm/templates/wasp/
├── api/
│   └── api.eta
├── crud/
│   └── crud.eta
└── route/
    └── page.eta
```

## Wasp Improvements

The Wasp plugin provides a number of improvements to standard Wasp functionality:

### Enhanced Configuration

**Wasp:** Requires a single, monolithic `main.wasp` (or `main.wasp.ts`) file that defines all Wasp components for the application

**Swarm:** Only supports a `main.wasp.ts` file for application-level configuration, with additional `feature.wasp.ts` files that configure Wasp components for a single feature directory, positioning declarations with the relevant application features. Swarm provides an extended `App` class with fluent helper methods for more concise, readable configuration files and even sorts helper method calls for easier scanning.

`main.wasp.ts`:

```typescript
import { App } from "@ingenyus/swarm-wasp";

const app = await App.create("my-app", {
  title: "My Application",
  wasp: { version: "^0.18.1" },
});

app
  .auth({ method: "email" })
  .client({
    rootComponent: {
      importDefault: "Layout",
      from: "@src/shared/client/components/Layout",
    },
  });

export default app;
```

`feature.wasp.ts`:

```typescript
import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
    // Action definitions
    .addAction(feature, "createTask", {
      entities: ["Task"],
      auth: true,
    })
    .addAction(feature, "updateTask", {
      entities: ["Task"],
      auth: true,
    })
    // API definitions
    .addApi(feature, "getTasks", {
      method: "GET",
      route: "undefined",
      entities: ["Task"],
      auth: true,
      customMiddleware: true,
    })
    // CRUD definitions
    .addCrud(feature, "Tasks", {
      entity: "Task",
      get: {
        isPublic: true
      },
      getAll: {
        isPublic: true
      },
      create: {
        override: true
      },
      update: {
        override: true
      },
    })
    // Query definitions
    .addQuery(feature, "getUserTasks", {
      entities: ["Task"],
      auth: true,
    });
}
```

#### Available Methods

- `.addRoute()` - Simplified route creation with automatic component imports
- `.addApi()` - API endpoint creation with middleware support
- `.addCrud()` - CRUD operations with custom overrides
- `.addAction()` - Action creation with entity access
- `.addQuery()` - Query creation with authentication
- `.addJob()` - Background job creation with cron scheduling
- `.addApiNamespace()` - API namespace creation with middleware

#### :warning: Typescript Configuration

By default, Wasp only supports a monolithic `main.wasp.ts` file, but Swarm enables this to be broken up into multiple files. This is preconfigured if you're using the [Swarm Wasp Starter](https://github.com/Genyus/swarm-wasp-starter), but if you're configuring Swarm in your own project, you must first make the following change to `tsconfig.wasp.json`:

```diff
-  "include": ["main.wasp.ts"]
+  "include": ["main.wasp.ts", "src/**/feature.wasp.ts"]
```

### Clean Directory Structure

**Wasp:** Doesn't recommend any particular structure

**Swarm:** Imposes a feature-based structure, with self-contained feature directories holding client- and server-side components, plus Wasp configuration files

```
src/
├── features/
│   └── <feature-name>/
│       ├── feature.wasp.ts           # Feature-level Wasp configuration
│       ├── client/
│       │   └── components/           # General components
│       │   └── pages/                # Page components
│       └── server/
│           ├── actions/              # Actions
│           ├── apis/                 # API Endpoints
│           ├── cruds/                # CRUD Operations
│           ├── jobs/                 # Background Jobs
│           ├── middleware/           # API Middleware
│           └── queries/              # Queries
├── shared/
│   ├── client/
│   │   ├── components/               # Shared React components
│   │   ├── hooks/                    # Custom React hooks
│   │   └── lib/                      # Utility functions
│   └── server/
│       └── middleware/               # Global middleware

├── main.wasp.ts                      # Application-level Wasp configuration
└── schema.prisma                     # Database schema
```

### Consistent File Structure

**Wasp:** Recommends monolithic files like `actions.ts` and `queries.ts` that contain multiple instances

**Swarm:** Maintains a component-per-file pattern for Wasp (back-end) components. This keeps component files smaller, more readable and consistent with front-end components.

## MCP Integration

Swarm automatically exposes all generators as MCP tools for AI-assisted development. To configure your preferred AI tool, see the [MCP Configuration Guide](../swarm/docs/MCP_CONFIGURATION.md).

### Example AI Prompts

Once MCP is configured, you can use prompts like:

```
"Create a user management feature with a route to a dashboard page, a daily job to mark users haven't logged in for 30 days as inactive, and user CRUD operations where getting users or a single user are public operations, but without the delete operation enabled"
```

```
"Generate an authenticated API endpoint for getting filtered user tasks"
```

```
"Add a new stats page to the dashboard that will retrieve stats via the getUserStats query, requiring authentication"
```
