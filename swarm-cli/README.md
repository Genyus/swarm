# @genyus/swarm

A powerful TypeScript CLI tool for rapidly generating features, APIs, jobs, CRUD operations, and more in **Wasp full-stack framework** projects. Built with type safety, modularity, and extensibility in mind.

Wasp is a full-stack web framework that lets you develop web apps in React, Node.js, and Prisma with minimal boilerplate. This CLI accelerates development by generating all the necessary files, configurations, and boilerplate code that follows Wasp's conventions and best practices.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Examples](#examples)
- [Project Structure](#project-structure)
- [Templates](#templates)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Global Installation
```bash
npm install -g @genyus/swarm
# or
yarn global add @genyus/swarm
```

### Local Project Usage
```bash
npx @genyus/swarm <command>
# or
yarn dlx @genyus/swarm <command>
```

## Quick Start

**Prerequisites**: Make sure you're in a Wasp project directory before running these commands.

Generate a complete feature with all components:

```bash
# Create a new feature
swarm feature documents

# Add routes to the feature
swarm route documents --path "/documents" --auth
swarm route documents --path "/documents/admin" --name "AdminPage" --auth

# Create API endpoints
swarm api documents --name "searchApi" --method GET --route "/api/documents/search"
swarm api documents --name "createDocument" --method POST --route "/api/documents" --auth

# Add CRUD operations
swarm crud documents --datatype Document

# Create background jobs
swarm job documents --name "archiveDocuments" --entities Document --schedule "0 2 * * *"

# Add API namespace with middleware
swarm apinamespace documents --name "api" --path "/api"
```

## Commands

### Core Commands

#### `swarm feature <name>`
Creates a new feature with its directory structure and configuration.

**Options:**
- `--force` - Overwrite existing files

**Examples:**
```bash
swarm feature users
swarm feature blog/posts  # Creates a sub-feature
```

#### `swarm route <feature> --path <path>`
Generates route definitions and page components.

**Options:**
- `--path <path>` - Route path (required)
- `--name <name>` - Custom page component name
- `--auth` - Require authentication
- `--force` - Overwrite existing files

**Examples:**
```bash
swarm route users --path "/users"
swarm route users --path "/users/profile" --name "UserProfile" --auth
```

#### `swarm api <feature> --name <name> --method <method> --route <route>`
Creates API endpoints with handlers.

**Options:**
- `--name <name>` - API handler name (required)
- `--method <method>` - HTTP method: GET, POST, PUT, DELETE (required)
- `--route <route>` - API route path (required)
- `--entities <entities>` - Comma-separated list of entities
- `--auth` - Require authentication
- `--force` - Overwrite existing files

**Examples:**
```bash
swarm api users --name "getUserProfile" --method GET --route "/api/users/profile" --auth
swarm api users --name "searchUsers" --method GET --route "/api/users/search" --entities "User,Profile"
```

#### `swarm crud <feature> --datatype <type>`
Generates complete CRUD operations for a data type.

**Options:**
- `--datatype <type>` - Entity/model name (required)
- `--public <operations>` - Comma-separated list of public operations
- `--override <operations>` - Comma-separated list of operations to override
- `--exclude <operations>` - Comma-separated list of operations to exclude
- `--force` - Overwrite existing files

**Operations:** `get`, `getAll`, `create`, `update`, `delete`

**Examples:**
```bash
swarm crud users --datatype User
swarm crud users --datatype User --public "get,getAll" --override "create,update"
swarm crud posts --datatype Post --exclude "delete"
```

#### `swarm operation <feature> --operation <op> --datatype <type>`
Creates individual query or action operations.

**Options:**
- `--operation <op>` - Operation type: get, getAll, create, update, delete (required)
- `--datatype <type>` - Entity/model name (required)
- `--entities <entities>` - Comma-separated list of entities (default: datatype)
- `--auth` - Require authentication
- `--force` - Overwrite existing files

**Examples:**
```bash
swarm operation users --operation "get" --datatype User
swarm operation users --operation "create" --datatype User --auth
swarm operation posts --operation "getAll" --datatype Post --entities "Post,User,Category"
```

#### `swarm job <feature> --name <name>`
Creates background job workers.

**Options:**
- `--name <name>` - Job name (required)
- `--entities <entities>` - Comma-separated list of entities
- `--schedule <cron>` - Cron schedule expression
- `--schedule-args <args>` - JSON string of schedule arguments
- `--force` - Overwrite existing files

**Examples:**
```bash
swarm job users --name "welcomeEmail" --entities User
swarm job analytics --name "generateReports" --schedule "0 6 * * *" --schedule-args "{}"
```

#### `swarm apinamespace <feature> --name <name> --path <path>`
Creates API namespaces with middleware.

**Options:**
- `--name <name>` - Namespace name (required)
- `--path <path>` - Namespace path (required)
- `--force` - Overwrite existing files

**Examples:**
```bash
swarm apinamespace users --name "api" --path "/api"
swarm apinamespace admin --name "adminApi" --path "/admin/api"
```

### Global Options

- `--help` - Show command help
- `--version` - Show CLI version
- `--force` - Force overwrite existing files (available on most commands)

## Examples

### Building a Blog Feature

```bash
# 1. Create the main feature
swarm feature blog

# 2. Add routes for different pages
swarm route blog --path "/blog" --name "BlogIndex"
swarm route blog --path "/blog/create" --name "CreatePost" --auth
swarm route blog --path "/blog/:slug" --name "BlogPost"

# 3. Create API endpoints
swarm api blog --name "getPublishedPosts" --method GET --route "/api/blog/posts"
swarm api blog --name "createPost" --method POST --route "/api/blog/posts" --auth
swarm api blog --name "getPostBySlug" --method GET --route "/api/blog/posts/:slug"

# 4. Add CRUD operations for posts
swarm crud blog --datatype Post --override "create,update,delete"

# 5. Create background jobs
swarm job blog --name "publishScheduledPosts" --entities Post --schedule "*/15 * * * *"
swarm job blog --name "generateSitemap" --schedule "0 3 * * *"

# 6. Add API namespace
swarm apinamespace blog --name "blogApi" --path "/api/blog"
```

### E-commerce User Management

```bash
# 1. Create user feature
swarm feature users

# 2. User-facing routes
swarm route users --path "/profile" --name "UserProfile" --auth
swarm route users --path "/settings" --name "UserSettings" --auth

# 3. Admin routes (sub-feature)
swarm feature users/admin
swarm route users/admin --path "/admin/users" --name "AdminUserList" --auth
swarm route users/admin --path "/admin/users/:id" --name "AdminUserDetail" --auth

# 4. User APIs
swarm api users --name "getCurrentUser" --method GET --route "/api/users/me" --auth
swarm api users --name "updateProfile" --method PUT --route "/api/users/profile" --auth
swarm api users --name "uploadAvatar" --method POST --route "/api/users/avatar" --auth

# 5. Admin APIs
swarm api users --name "getAllUsers" --method GET --route "/api/admin/users" --auth
swarm api users --name "banUser" --method POST --route "/api/admin/users/:id/ban" --auth

# 6. CRUD operations
swarm crud users --datatype User --public "get" --override "update"

# 7. Background jobs
swarm job users --name "sendWelcomeEmail" --entities User
swarm job users --name "cleanupInactiveUsers" --schedule "0 2 * * 0"
```

## Project Structure

The CLI generates **Wasp-compatible** files and configurations following this structure:

```
your-project/
├── config/                 # Feature configurations
│   ├── users.wasp.ts       # Generated feature configs
│   └── blog.wasp.ts
├── features/               # Feature implementations
│   ├── users/
│   │   └── _core/
│   │       ├── client/     # React components, hooks
│   │       ├── server/     # Server-side logic
│   │       │   ├── api/    # API handlers
│   │       │   ├── actions/ # Server actions
│   │       │   ├── queries/ # Server queries
│   │       │   ├── jobs/   # Background jobs
│   │       │   └── crud/   # CRUD operations
│   │       └── types/      # Shared types
│   └── blog/
│       └── _core/
│           └── ...
```

## Templates

The CLI uses a comprehensive template system located in `src/templates/`:

### Configuration Templates (`src/templates/config/`)
- `feature.wasp.ts` - Main feature configuration
- `api.ts` - API endpoint configuration
- `route.ts` - Route definition configuration
- `job.ts` - Background job configuration
- `crud.ts` - CRUD operation configuration
- `operation.ts` - Individual operation configuration
- `apiNamespace.ts` - API namespace configuration

### File Templates (`src/templates/files/`)

#### Server Templates (`src/templates/files/server/`)
- `api.ts` - API handler template
- `job.ts` - Background job worker template
- `middleware.ts` - API namespace middleware template
- `queries/get.ts` - Get query template
- `queries/getAll.ts` - Get all query template
- `actions/create.ts` - Create action template
- `actions/update.ts` - Update action template
- `actions/delete.ts` - Delete action template

#### Client Templates (`src/templates/files/client/`)
- `page.tsx` - React page component template
- `component.tsx` - React component template
- `hook.ts` - Custom React hook template
- `layout.tsx` - Layout component template

#### Feature Templates (`src/templates/feature/`)
- Directory structure templates for top-level and sub-features

All templates support variable substitution using `{{variable}}` syntax and are processed with entity metadata for type-safe generation.

## Development

### Prerequisites

- Node.js 18+
- TypeScript 5+
- Wasp 0.15+ with [TypeScript configuration](https://wasp.sh/docs/general/wasp-ts-config) enabled

> **Note**: This CLI generates Wasp-specific code and configurations. All commands must be executed within a Wasp project for the generated code to function properly. Learn more about Wasp at [wasp.sh](https://wasp.sh).

### Setup

```bash
# Clone and install dependencies
git clone <repository-url>
cd swarm-cli
npm install

# Build the project
npm run build

# Run tests
npm test

# Watch mode for development
npm run build:watch
```

### Project Architecture

```
src/
├── cli/                    # CLI commands and entry points
│   ├── commands/          # Individual command implementations
│   └── index.ts           # Main CLI setup
├── generators/            # Core generation logic
│   ├── api.ts            # API generator
│   ├── feature.ts        # Feature generator
│   ├── crud.ts           # CRUD generator
│   └── ...               # Other generators
├── utils/                 # Shared utilities
│   ├── prisma.ts         # Prisma schema utilities
│   ├── templates.ts      # Template processing
│   ├── io.ts             # File system operations
│   └── strings.ts        # String manipulation
├── types/                 # TypeScript type definitions
└── templates/             # Generation templates
```

### Adding New Commands

1. Create a new generator in `src/generators/`
2. Add a command file in `src/cli/commands/`
3. Add any new templates to `src/templates/`
4. Update types in `src/types/` if needed
5. Add tests for the new functionality

## Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run specific test files
npm test src/generators/api.test.ts
npm test test/integration.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

- **Unit Tests**: Located alongside source files (e.g., `src/utils/io.test.ts`)
- **Integration Tests**: Located in `test/` directory
- **82 total tests** covering all generators, utilities, and integration scenarios

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature/my-new-feature`
7. Submit a pull request

### Guidelines

- Follow TypeScript best practices
- Add tests for new functionality
- Update documentation for new features
- Use semantic commit messages
- Ensure all existing tests continue to pass

## License

MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for Wasp framework developers** 