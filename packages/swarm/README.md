# @ingenyus/swarm

A powerful TypeScript library providing core generators, templates, utilities, and types for **Wasp full-stack framework** development. Built with type safety, modularity, and extensibility in mind.

Wasp is a full-stack web framework that lets you develop web apps in React, Node.js, and Prisma with minimal boilerplate. This core library provides the foundational building blocks for generating all the necessary files, configurations, and boilerplate code that follows Wasp's conventions and best practices.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Generators](#generators)
- [Templates](#templates)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install @ingenyus/swarm
# or
yarn add @ingenyus/swarm
# or
pnpm add @ingenyus/swarm
```

## Quick Start

```typescript
import { 
  ApiGenerator, 
  FeatureGenerator, 
  CrudGenerator,
  FileSystem,
  Logger 
} from '@ingenyus/swarm';

// Initialize generators
const apiGen = new ApiGenerator();
const featureGen = new FeatureGenerator();
const crudGen = new CrudGenerator();

// Use utilities
const fs = new FileSystem();
const logger = new Logger();

// Generate a feature
await featureGen.generate('users', { force: false });

// Generate API endpoints
await apiGen.generate('users', {
  name: 'getUsers',
  method: 'GET',
  route: '/api/users',
  auth: true,
  force: false
});

// Generate CRUD operations
await crudGen.generate('users', {
  dataType: 'User',
  public: ['get', 'getAll'],
  force: false
});
```

## Generators

#### `ApiGenerator`
Creates API endpoints with handlers and configurations.

```typescript
import { ApiGenerator, ApiFlags } from '@ingenyus/swarm';

const generator = new ApiGenerator();
const flags: ApiFlags = {
  name: 'getUserProfile',
  method: 'GET',
  route: '/api/users/profile',
  entities: ['User'],
  auth: true,
  force: false
};

await generator.generate('users', flags);
```

#### `FeatureGenerator`
Creates complete feature structures with directories and configurations.

```typescript
import { FeatureGenerator, CommonGeneratorFlags } from '@ingenyus/swarm';

const generator = new FeatureGenerator();
const flags: CommonGeneratorFlags = {
  force: false
};

await generator.generate('blog/posts', flags);
```

#### `CrudGenerator`
Generates complete CRUD operations for data types.

```typescript
import { CrudGenerator, CrudFlags } from '@ingenyus/swarm';

const generator = new CrudGenerator();
const flags: CrudFlags = {
  dataType: 'Post',
  public: ['get', 'getAll', 'create'],
  override: ['update'],
  exclude: ['delete'],
  force: false
};

await generator.generate('blog', flags);
```

#### `JobGenerator`
Creates background job workers with scheduling.

```typescript
import { JobGenerator, JobFlags } from '@ingenyus/swarm';

const generator = new JobGenerator();
const flags: JobFlags = {
  name: 'sendWelcomeEmail',
  entities: ['User'],
  schedule: '0 9 * * *',
  scheduleArgs: '{}',
  force: false
};

await generator.generate('users', flags);
```

#### `OperationGenerator`
Creates individual query or action operations.

```typescript
import { OperationGenerator, OperationFlags } from '@ingenyus/swarm';

const generator = new OperationGenerator();
const flags: OperationFlags = {
  operation: 'get',
  dataType: 'User',
  entities: ['User', 'Profile'],
  auth: true,
  force: false
};

await generator.generate('users', flags);
```

#### `RouteGenerator`
Generates route definitions and page components.

```typescript
import { RouteGenerator, RouteFlags } from '@ingenyus/swarm';

const generator = new RouteGenerator();
const flags: RouteFlags = {
  name: 'UserProfile',
  path: '/users/profile',
  auth: true,
  force: false
};

await generator.generate('users', flags);
```

#### `ApiNamespaceGenerator`
Creates API namespaces with middleware.

```typescript
import { ApiNamespaceGenerator, ApiNamespaceFlags } from '@ingenyus/swarm';

const generator = new ApiNamespaceGenerator();
const flags: ApiNamespaceFlags = {
  name: 'api',
  path: '/api',
  force: false
};

await generator.generate('users', flags);
```

## Templates

The library includes a comprehensive template system for generating Wasp-compatible code:

### Configuration Templates
- `feature.wasp.ts` - Main feature configuration
- `api.ts` - API endpoint configuration  
- `route.ts` - Route definition configuration
- `job.ts` - Background job configuration
- `crud.ts` - CRUD operation configuration
- `operation.ts` - Individual operation configuration
- `apiNamespace.ts` - API namespace configuration

### File Templates

#### Server Templates
- `api.ts` - API endpoint template
- `job.ts` - Background job worker template
- `middleware.ts` - API namespace middleware template
- `queries/get.ts` - Get query template
- `queries/getAll.ts` - Get all query template
- `actions/create.ts` - Create action template
- `actions/update.ts` - Update action template
- `actions/delete.ts` - Delete action template

#### Client Templates
- `page.tsx` - React page component template
- `component.tsx` - React component template
- `hook.ts` - Custom React hook template
- `layout.tsx` - Layout component template

#### Feature Templates
- Directory structure templates for top-level and sub-features

All templates support variable substitution using `{{variable}}` syntax and are processed with entity metadata for type-safe generation.

## Development

### Prerequisites

- Node.js 18+
- TypeScript 5+
- Wasp 0.15+ with [TypeScript configuration](https://wasp.sh/docs/general/wasp-ts-config) enabled

> **Note**: This library generates Wasp-specific code and configurations. All operations must be executed within a Wasp project for the generated code to function properly. Learn more about Wasp at [wasp.sh](https://wasp.sh).

### Setup

```bash
# Clone and install dependencies
git clone <repository-url>
cd swarm
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Watch mode for development
pnpm build:watch
```

### Project Architecture

```
src/
├── generators/           # Core generation logic
│   ├── api.ts            # API generator
│   ├── feature.ts        # Feature generator
│   ├── crud.ts           # CRUD generator
│   ├── job.ts            # Job generator
│   ├── operation.ts      # Operation generator
│   ├── route.ts          # Route generator
│   └── apinamespace.ts   # API namespace generator
├── utils/                # Shared utilities
│   ├── prisma.ts         # Prisma schema utilities
│   ├── templates.ts      # Template processing
│   ├── filesystem.ts     # File system operations
│   ├── strings.ts        # String manipulation
│   ├── logger.ts         # Logging utilities
│   └── errors.ts         # Error handling
├── types/                # TypeScript type definitions
│   ├── constants.ts      # Shared constants
│   ├── interfaces.ts     # Interface definitions
│   ├── filesystem.ts     # File system types
│   ├── generator.ts      # Generator types
│   ├── logger.ts         # Logger types
│   └── prisma.ts         # Prisma types
└── templates/            # Generation templates
    ├── config/           # Configuration templates
    ├── files/            # File templates
    └── feature/          # Feature structure templates
```

## Testing

The library includes comprehensive test coverage:

```bash
# Run all tests
pnpm test

# Run specific test files
pnpm test src/generators/api.test.ts
pnpm test src/utils/filesystem.test.ts

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage
pnpm test -- --coverage
```

### Test Structure

- **Unit Tests**: Located alongside source files (e.g., `src/utils/filesystem.test.ts`)
- **Integration Tests**: Located in `tests/` directory
- **Comprehensive coverage** of all generators, utilities, and core functionality

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `pnpm test`
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
