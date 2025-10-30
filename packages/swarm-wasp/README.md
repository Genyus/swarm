<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Genyus/swarm/HEAD/docs/images/swarm-logo-horizontal-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Genyus/swarm/HEAD/docs/images/swarm-logo-horizontal.svg">
    <img alt="Swarm - Typescript Code Generator" src="https://raw.githubusercontent.com/Genyus/swarm/HEAD/docs/images/docs/swarm-logo-horizontal.svg" width="350" style="max-width: 100%;">
  </picture>
</p>

# @ingenyus/swarm-wasp

A [Swarm](../swarm/README.md) plugin that provides a set of tools for accelerated [Wasp](https://wasp.sh) app development.

## Features

### Component Generators

This plugin defines generators for feature directories and all documented Wasp components (API endpoints and namespaces, CRUD operations, Actions, Queries, Routes and Jobs). The generated boilerplate is fully type-safe and compatible with your Prisma schema

#### Feature Generator
Generates feature directories containing a Wasp configuration file.

:lightbulb: **NOTE:** Feature directories can be nested, child directories will be added to the "features" sub-directory under the parent feature.

```
Usage: swarm-cli feature [options]

Generates a feature directory containing a Wasp configuration file

Options:
  -t, --target <target>  The target path of the generated directory (examples: dashboard/users,
                         features/dashboard/features/users)
  -h, --help             display help for command
```

#### Action Generator
Generates [Actions](https://wasp.sh/docs/data-model/operations/actions).

```
Usage: swarm-cli action [options]

Generates a Wasp action

Options:
  -f, --feature <feature>       The feature directory this component will be generated in (examples: 'root', 'auth',
                                'dashboard/users')
  -o, --operation <operation>   The action operation to generate (examples: 'create', 'update', 'delete')
  -d, --data-type <data-type>   The data type/model name for this operation (examples: 'User', 'Product', 'Task')
  -n, --name [name]             The name of the generated component (examples: 'users', 'task')
  -e, --entities [entities...]  The Wasp entities that will be available to this component (optional) (examples: 'User',
                                'User' 'Task')
  -F, --force                   Force overwrite of existing files and configuration entries (optional)
  -a, --auth                    Require authentication for this component (optional)
  -h, --help                    display help for command
```

#### API Generator
Generates [API Endpoints](https://wasp.sh/docs/advanced/apis)

```
Usage: swarm-cli api [options]

Generates a Wasp API Endpoint

Options:
  -m, --method <method>         The HTTP method used for this API endpoint (examples: 'ALL', 'GET', 'POST', 'PUT', 'DELETE')
  -f, --feature <feature>       The feature directory this component will be generated in (examples: 'root', 'auth',
                                'dashboard/users')
  -n, --name <name>             The name of the generated component (examples: 'users', 'task')
  -p, --path <path>             The path that this component will be accessible at (examples: '/api/users/:id',
                                '/api/products')
  -e, --entities [entities...]  The Wasp entities that will be available to this component (optional) (examples: 'User',
                                'User' 'Task')
  -a, --auth                    Require authentication for this component (optional)
  -F, --force                   Force overwrite of existing files and configuration entries (optional)
  -c, --custom-middleware       Enable custom middleware for this API endpoint
  -h, --help                    display help for command
```

#### API Namespace Generator
Creates [API Namespaces](https://wasp.sh/docs/advanced/middleware-config#3-customize-per-path-middleware)

```
Usage: swarm-cli api-namespace [options]

Generates a Wasp API Namespace

Options:
  -f, --feature <feature>  The feature directory this component will be generated in (examples: 'root', 'auth',
                           'dashboard/users')
  -n, --name <name>        The name of the generated component (examples: 'users', 'task')
  -p, --path <path>        The path that this component will be accessible at (examples: '/api/users/:id', '/api/products')
  -F, --force              Force overwrite of existing files and configuration entries (optional)
  -h, --help               display help for command
```

#### CRUD Generator
Generates [CRUD Operations](https://wasp.sh/docs/data-model/crud)

```
Usage: swarm-cli crud [options]

Generates a Wasp CRUD operation

Options:
  -f, --feature <feature>       The feature directory this component will be generated in (examples: 'root', 'auth',
                                'dashboard/users')
  -n, --name <name>             The name of the generated component (examples: 'users', 'task')
  -d, --data-type <data-type>   The data type/model name for this operation (examples: 'User', 'Product', 'Task')
  -b, --public [public...]      Public CRUD operations (accessible without authentication) (examples: 'get', 'get' 'getAll')
  -v, --override [override...]  Override existing CRUD operations (examples: 'create', 'create' 'update')
  -x, --exclude [exclude...]    Exclude specific CRUD operations from generation (examples: 'delete', 'delete' 'update')
  -F, --force                   Force overwrite of existing files and configuration entries (optional)
  -h, --help                    display help for command
```

#### Job Generator
Generates Jobs

```
Usage: swarm-cli job [options]

Generates a Wasp Job

Options:
  -f, --feature <feature>       The feature directory this component will be generated in (examples: 'root', 'auth',
                                'dashboard/users')
  -n, --name <name>             The name of the generated component (examples: 'users', 'task')
  -e, --entities [entities...]  The Wasp entities that will be available to this component (optional) (examples: 'User',
                                'User' 'Task')
  -c, --cron [cron]             Cron schedule expression for the job (examples: 0 9 * * *, */15 * * * *, 0 0 1 * *)
  -a, --args [args]             Arguments to pass to the job function when executed (examples: {"userId": 123}, {"type":
                                "cleanup", "batchSize": 100})
  -F, --force                   Force overwrite of existing files and configuration entries (optional)
  -h, --help                    display help for command
```

#### Query Generator
Generates [Queries](https://wasp.sh/docs/data-model/operations/queries)

```
Usage: swarm-cli query [options]

Generates a Wasp Query

Options:
  -f, --feature <feature>       The feature directory this component will be generated in (examples: 'root', 'auth',
                                'dashboard/users')
  -o, --operation <operation>   The query operation to generate (examples: 'get', 'getAll', 'getFiltered')
  -d, --data-type <data-type>   The data type/model name for this operation (examples: 'User', 'Product', 'Task')
  -n, --name [name]             The name of the generated component (examples: 'users', 'task')
  -e, --entities [entities...]  The Wasp entities that will be available to this component (optional) (examples: 'User',
                                'User' 'Task')
  -F, --force                   Force overwrite of existing files and configuration entries (optional)
  -a, --auth                    Require authentication for this component (optional)
  -h, --help                    display help for command
```

#### Route Generator
Generates [Routed Pages](https://wasp.sh/docs/tutorial/pages)

```
Usage: swarm-cli route [options]

Generates a Wasp Page and Route

Options:
  -f, --feature <feature>  The feature directory this component will be generated in (examples: 'root', 'auth',
                           'dashboard/users')
  -n, --name <name>        The name of the generated component (examples: 'users', 'task')
  -p, --path <path>        The path that this component will be accessible at (examples: '/api/users/:id', '/api/products')
  -a, --auth               Require authentication for this component (optional)
  -F, --force              Force overwrite of existing files and configuration entries (optional)
  -h, --help               display help for command
```

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

The Wasp plugin follows a number of conventions that change standard Wasp practises for the better:

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
    // Api definitions
    .addApi(feature, "getTasks", {
      method: "GET",
      route: "undefined",
      entities: ["Task"],
      auth: true,
      customMiddleware: true,
    })
    // Crud definitions
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

#### Composable Configuration

Standard Wasp TS Config uses a monolithic `main.wasp.ts` file, but Swarm enables this to be broken up into multiple files. This is preconfigured if you're using the [Swarm Wasp Starter](https://github.com/Genyus/swarm-wasp-starter), but if you're configuring Swarm in your own project, you must make the following change to `tsconfig.wasp.json`:

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
│       │   └── components/           # React components
│       │   └── pages/                # React pages
│       └── server/
│           ├── actions/              # Wasp actions
│           ├── apis/                 # API endpoints
│           ├── cruds/                # CRUD operations
│           ├── jobs/                 # Background jobs
│           ├── middleware/           # API middleware
│           └── queries/              # Wasp queries
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

**Swarm:** Maintains a component-per-file pattern for Wasp (back-end) components in alignment with front-end conventions. This keeps component files smaller and more readable.

## MCP Integration

Swarm automatically exposes all generators as MCP tools for AI-assisted development.

### Setup

1. **Install the plugin:**
   ```bash
   npm install @ingenyus/swarm @ingenyus/swarm-wasp
   ```

2. **Configure your AI tool** (see [MCP Setup Guide](../../docs/MCP_SETUP.md))

3. **Start the MCP server:**
   ```bash
   npx swarm-mcp
   ```

### Available MCP Tools

All generators are available as MCP tools:
- `swarm_feature` - Feature directory generation
- `swarm_action` - Action generation
- `swarm_api` - API endpoint generation
- `swarm_api_namespace` - API namespace generation
- `swarm_crud` - CRUD operation generation
- `swarm_job` - Job generation
- `swarm_query` - Query generation
- `swarm_route` - Route generation

### Example AI Prompts

Once MCP is configured, you can use prompts like:

```
"Create a user management feature with a dashboard route, user CRUD operations, and a welcome email job"
```

```
"Generate an API endpoint for getting user tasks with authentication required"
```

```
"Add a new route for the dashboard feature that requires authentication"
```

## Swarm Configuration

Swarm can be configured via the swarm.config.json file, or by a `swarm` block in `package.json`. The configuration object accepts a list of plugins, defined with `import` and `from` specifying the plugin object and source. The plugin object accepts an optional `generators` array and a `disabled` property, allowing individiual plugins and generators to be disabled if necessary:

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

## Development

This package is part of the Swarm monorepo. See the main [README](../../README.md) for development setup instructions.
