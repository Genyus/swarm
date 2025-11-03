# Generators Reference

This document provides a complete reference for all available generators in the Swarm Wasp plugin. Each generator is available both as an MCP tool (for AI-assisted development) and as a CLI command.

## Feature Generator

Generates feature directories containing a child Wasp configuration file (`feature.wasp.ts`).

**Note:** Feature directories can be nested, child directories will be added to the "features" sub-directory under the parent feature.

### CLI Command

```
Usage: swarm feature [options]

Generates a feature directory containing a Wasp configuration file

Options:
  -t, --target <target>  The target path of the generated directory (examples: dashboard/users,
                         features/dashboard/features/users)
  -h, --help             display help for command
```

### MCP Tool

```json
{
  "name": "generate-feature",
  "description": "Generates a feature directory containing a Wasp configuration file",
  "inputSchema": {
    "type": "object",
    "properties": {
      "target": {
        "type": "string",
        "description": "The target path of the generated directory",
        "examples": ["dashboard/users", "features/dashboard/features/users"]
      }
    },
    "required": ["target"]
  }
}
```

## Action Generator

Generates [Actions](https://wasp.sh/docs/data-model/operations/actions).

### CLI Command

```
Usage: swarm action [options]

Generates a Wasp Action

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

### MCP Tool

```json
{
  "name": "generate-action",
  "description": "Generates a Wasp Action",
  "inputSchema": {
    "type": "object",
    "properties": {
      "feature": {
        "type": "string",
        "description": "The feature directory this component will be generated in",
        "examples": ["root", "auth", "dashboard/users"]
      },
      "operation": {
        "type": "string",
        "description": "The action operation to generate",
        "enum": ["create", "update", "delete"]
      },
      "dataType": {
        "type": "string",
        "description": "The data type/model name for this operation",
        "examples": ["User", "Product", "Task"]
      },
      "name": {
        "type": "string",
        "description": "The name of the generated component (optional)",
        "examples": ["users", "task"]
      },
      "entities": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "The Wasp entities that will be available to this component (optional)",
        "examples": ["User", "Task"]
      },
      "force": {
        "type": "boolean",
        "description": "Force overwrite of existing files and configuration entries (optional)"
      },
      "auth": {
        "type": "boolean",
        "description": "Require authentication for this component (optional)"
      }
    },
    "required": ["feature", "operation", "dataType"]
  }
}
```

## API Generator

Generates [API Endpoints](https://wasp.sh/docs/advanced/apis).

### CLI Command

```
Usage: swarm api [options]

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

### MCP Tool

```json
{
  "name": "generate-api",
  "description": "Generates a Wasp API Endpoint",
  "inputSchema": {
    "type": "object",
    "properties": {
      "method": {
        "type": "string",
        "description": "The HTTP method used for this API endpoint",
        "enum": ["ALL", "GET", "POST", "PUT", "DELETE"]
      },
      "feature": {
        "type": "string",
        "description": "The feature directory this component will be generated in",
        "examples": ["root", "auth", "dashboard/users"]
      },
      "name": {
        "type": "string",
        "description": "The name of the generated component",
        "examples": ["users", "task"]
      },
      "path": {
        "type": "string",
        "description": "The path that this component will be accessible at",
        "examples": ["/api/users/:id", "/api/products"]
      },
      "entities": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "The Wasp entities that will be available to this component (optional)",
        "examples": ["User", "Task"]
      },
      "auth": {
        "type": "boolean",
        "description": "Require authentication for this component (optional)"
      },
      "force": {
        "type": "boolean",
        "description": "Force overwrite of existing files and configuration entries (optional)"
      },
      "customMiddleware": {
        "type": "boolean",
        "description": "Enable custom middleware for this API endpoint"
      }
    },
    "required": ["method", "feature", "name", "path"]
  }
}
```

## API Namespace Generator

Creates [API Namespaces](https://wasp.sh/docs/advanced/middleware-config#3-customize-per-path-middleware).

### CLI Command

```
Usage: swarm api-namespace [options]

Generates a Wasp API Namespace

Options:
  -f, --feature <feature>  The feature directory this component will be generated in (examples: 'root', 'auth',
                           'dashboard/users')
  -n, --name <name>        The name of the generated component (examples: 'users', 'task')
  -p, --path <path>        The path that this component will be accessible at (examples: '/api/users/:id', '/api/products')
  -F, --force              Force overwrite of existing files and configuration entries (optional)
  -h, --help               display help for command
```

### MCP Tool

```json
{
  "name": "generate-api-namespace",
  "description": "Generates a Wasp API Namespace",
  "inputSchema": {
    "type": "object",
    "properties": {
      "feature": {
        "type": "string",
        "description": "The feature directory this component will be generated in",
        "examples": ["root", "auth", "dashboard/users"]
      },
      "name": {
        "type": "string",
        "description": "The name of the generated component",
        "examples": ["users", "task"]
      },
      "path": {
        "type": "string",
        "description": "The path that this component will be accessible at",
        "examples": ["/api/users/:id", "/api/products"]
      },
      "force": {
        "type": "boolean",
        "description": "Force overwrite of existing files and configuration entries (optional)"
      }
    },
    "required": ["feature", "name", "path"]
  }
}
```

## CRUD Generator

Generates [CRUD Operations](https://wasp.sh/docs/data-model/crud).

### CLI Command

```
Usage: swarm crud [options]

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

### MCP Tool

```json
{
  "name": "generate-crud",
  "description": "Generates a Wasp CRUD operation",
  "inputSchema": {
    "type": "object",
    "properties": {
      "feature": {
        "type": "string",
        "description": "The feature directory this component will be generated in",
        "examples": ["root", "auth", "dashboard/users"]
      },
      "name": {
        "type": "string",
        "description": "The name of the generated component",
        "examples": ["users", "task"]
      },
      "dataType": {
        "type": "string",
        "description": "The data type/model name for this operation",
        "examples": ["User", "Product", "Task"]
      },
      "public": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Public CRUD operations (accessible without authentication)",
        "examples": ["get", "getAll"]
      },
      "override": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Override existing CRUD operations",
        "examples": ["create", "update"]
      },
      "exclude": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Exclude specific CRUD operations from generation",
        "examples": ["delete", "update"]
      },
      "force": {
        "type": "boolean",
        "description": "Force overwrite of existing files and configuration entries (optional)"
      }
    },
    "required": ["feature", "name", "dataType"]
  }
}
```

## Job Generator

Generates Jobs.

### CLI Command

```
Usage: swarm job [options]

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

### MCP Tool

```json
{
  "name": "generate-job",
  "description": "Generates a Wasp Job",
  "inputSchema": {
    "type": "object",
    "properties": {
      "feature": {
        "type": "string",
        "description": "The feature directory this component will be generated in",
        "examples": ["root", "auth", "dashboard/users"]
      },
      "name": {
        "type": "string",
        "description": "The name of the generated component",
        "examples": ["users", "task"]
      },
      "entities": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "The Wasp entities that will be available to this component (optional)",
        "examples": ["User", "Task"]
      },
      "cron": {
        "type": "string",
        "description": "Cron schedule expression for the job",
        "examples": ["0 9 * * *", "*/15 * * * *", "0 0 1 * *"]
      },
      "args": {
        "type": "string",
        "description": "Arguments to pass to the job function when executed",
        "examples": ["{\"userId\": 123}", "{\"type\": \"cleanup\", \"batchSize\": 100}"]
      },
      "force": {
        "type": "boolean",
        "description": "Force overwrite of existing files and configuration entries (optional)"
      }
    },
    "required": ["feature", "name"]
  }
}
```

## Query Generator

Generates [Queries](https://wasp.sh/docs/data-model/operations/queries).

### CLI Command

```
Usage: swarm query [options]

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

### MCP Tool

```json
{
  "name": "generate-query",
  "description": "Generates a Wasp Query",
  "inputSchema": {
    "type": "object",
    "properties": {
      "feature": {
        "type": "string",
        "description": "The feature directory this component will be generated in",
        "examples": ["root", "auth", "dashboard/users"]
      },
      "operation": {
        "type": "string",
        "description": "The query operation to generate",
        "enum": ["get", "getAll", "getFiltered"]
      },
      "dataType": {
        "type": "string",
        "description": "The data type/model name for this operation",
        "examples": ["User", "Product", "Task"]
      },
      "name": {
        "type": "string",
        "description": "The name of the generated component (optional)",
        "examples": ["users", "task"]
      },
      "entities": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "The Wasp entities that will be available to this component (optional)",
        "examples": ["User", "Task"]
      },
      "force": {
        "type": "boolean",
        "description": "Force overwrite of existing files and configuration entries (optional)"
      },
      "auth": {
        "type": "boolean",
        "description": "Require authentication for this component (optional)"
      }
    },
    "required": ["feature", "operation", "dataType"]
  }
}
```

## Route Generator

Generates [Routed Pages](https://wasp.sh/docs/tutorial/pages).

### CLI Command

```
Usage: swarm route [options]

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

### MCP Tool

```json
{
  "name": "generate-route",
  "description": "Generates a Wasp Page and Route",
  "inputSchema": {
    "type": "object",
    "properties": {
      "feature": {
        "type": "string",
        "description": "The feature directory this component will be generated in",
        "examples": ["root", "auth", "dashboard/users"]
      },
      "name": {
        "type": "string",
        "description": "The name of the generated component",
        "examples": ["users", "task"]
      },
      "path": {
        "type": "string",
        "description": "The path that this component will be accessible at",
        "examples": ["/api/users/:id", "/api/products"]
      },
      "auth": {
        "type": "boolean",
        "description": "Require authentication for this component (optional)"
      },
      "force": {
        "type": "boolean",
        "description": "Force overwrite of existing files and configuration entries (optional)"
      }
    },
    "required": ["feature", "name", "path"]
  }
}
```
