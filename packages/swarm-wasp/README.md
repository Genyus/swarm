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
- [Requirements](#requirements)
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

## Requirements

### Wasp Version Compatibility

This package requires Wasp version **0.24.x** to be installed. The generators will automatically check your installed Wasp version and throw an error if it's incompatible.

To check your Wasp version:
```bash
wasp version
```

To install or update Wasp:
```bash
npm install -g @wasp.sh/wasp-cli@latest
```

The quickest way to start a new project is the [Swarm Wasp Starter](https://github.com/Genyus/swarm-wasp-starter), which ships a preconfigured Wasp 0.24 app ready for extension and customisation.

> **Upgrading from Wasp < 0.24?** Wasp 0.24 replaced the class-based TS config with the functional [Wasp Spec](https://wasp.sh/docs/general/wasp-ts-config) (`@wasp.sh/spec`). Feature config files now export a native `spec` array instead of a `configureFeature(app)` function — see [Enhanced Configuration](#enhanced-configuration) below. Existing `feature.wasp.ts` files are not migrated automatically.

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

**Wasp:** Wasp 0.24 supports splitting the [Wasp Spec](https://wasp.sh/docs/general/wasp-ts-config) across multiple `*.wasp.ts` files, but requires each one to be manually imported into `main.wasp.ts`.

**Swarm:** Keeps `main.wasp.ts` for application-level configuration and places a `feature.wasp.ts` file in each feature directory, co-locating declarations with the feature they configure. Each feature file exports an array of definitions, which Swarm **auto-discovers** and merges into the main spec.

`main.wasp.ts` (at the project root):

```typescript
import { app } from "@wasp.sh/spec";
import { Layout } from "./src/shared/client/components/Layout" with { type: "ref" };
import { featureSpecs } from "./src/features/index.wasp";

export default app({
  name: "my-app",
  title: "My Application",
  wasp: { version: "^0.24.0" },
  auth: {
    userEntity: "User",
    methods: { email: {} },
    onAuthFailedRedirectTo: "/login",
  },
  client: { rootComponent: Layout },
  spec: [featureSpecs],
});
```

`src/features/<feature>/feature.wasp.ts`:

```typescript
import { type Spec, action, api, crud, query } from "@wasp.sh/spec";
import { createTask, updateTask } from "./server/actions/..." with { type: "ref" };
import { getTasks } from "./server/apis/getTasks" with { type: "ref" };
import { getTasksMiddleware } from "./server/apis/middleware/getTasks" with { type: "ref" };
import { getUserTasks } from "./server/queries/getUserTasks" with { type: "ref" };

export const spec: Spec = [
  // Action definitions
  action(createTask, { entities: ["Task"], auth: true }),
  action(updateTask, { entities: ["Task"], auth: true }),
  // Api definitions
  api("GET", "/tasks", getTasks, { middlewareConfigFn: getTasksMiddleware, entities: ["Task"], auth: true }),
  // Crud definitions
  crud("Tasks", "Task", { get: { isPublic: true }, getAll: { isPublic: true }, create: { overrideFn: createTask }, update: { overrideFn: updateTask } }),
  // Query definitions
  query(getUserTasks, { entities: ["Task"], auth: true }),
];
```

`src/features/index.wasp.ts` (generated — do not edit):

```typescript
import type { Spec } from "@wasp.sh/spec";

import { spec as tasksSpec } from "./tasks/feature.wasp";

export const featureSpecs: Spec = [tasksSpec];
```

#### Generated declaration types

Swarm's generators emit native `@wasp.sh/spec` constructors into the feature's `spec` array (adding the matching `with { type: "ref" }` imports), so you get concise, convention-driven output without hand-writing import paths:

- `route()` - Route + page with automatic component imports
- `api()` - API endpoint with optional custom middleware
- `apiNamespace()` - API namespace with middleware
- `crud()` - CRUD operations with public/override options
- `action()` / `query()` - operations with entity access and auth
- `job()` - background job with cron scheduling

### Clean Directory Structure

**Wasp:** Doesn't recommend any particular structure

**Swarm:** Imposes a feature-based structure, with self-contained feature directories holding client- and server-side components, plus Wasp configuration files

```
├── main.wasp.ts                      # Application-level Wasp configuration (project root)
├── schema.prisma                     # Database schema
└── src/
    ├── features/
    │   ├── index.wasp.ts             # Generated features barrel (do not edit)
    │   └── <feature-name>/
    │       ├── feature.wasp.ts       # Feature-level Wasp configuration
    │       ├── client/
    │       │   ├── components/       # General components
    │       │   └── pages/            # Page components
    │       └── server/
    │           ├── actions/          # Actions
    │           ├── apis/             # API Endpoints
    │           ├── cruds/            # CRUD Operations
    │           ├── jobs/             # Background Jobs
    │           ├── middleware/       # API Middleware
    │           └── queries/          # Queries
    └── shared/
        ├── client/
        │   ├── components/           # Shared React components
        │   ├── hooks/                # Custom React hooks
        │   └── lib/                  # Utility functions
        └── server/
            └── middleware/           # Global middleware
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
