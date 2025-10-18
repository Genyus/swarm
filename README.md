# Swarm

A powerful TypeScript monorepo containing tools and utilities for Wasp full-stack framework development. Built with type safety, modularity, and extensibility in mind.

Wasp is a full-stack web framework that lets you develop web apps in React, Node.js, and Prisma with minimal boilerplate. Swarm accelerates development by generating all the necessary files, configurations, and boilerplate code that follows Wasp's conventions and best practices.

## Packages

### Core Package
- [`@ingenyus/swarm`](./packages/swarm) - Core shared logic including generators, templates, utilities, and types

### CLI Package
- [`@ingenyus/swarm-cli`](./packages/swarm-cli) - A CLI tool for rapidly generating features, APIs, jobs, CRUD operations, and more

### MCP Package
- [`@ingenyus/swarm-mcp`](./packages/swarm-mcp) - A Model Context Protocol server for AI agent integration

## Quick Start

### CLI Usage
```bash
# Install globally
npm install -g @ingenyus/swarm

# Or use with npx
npx @ingenyus/swarm feature users
npx @ingenyus/swarm api users --name "getUsers" --method GET --route "/api/users"
npx @ingenyus/swarm crud users --datatype User
```

### Programmatic Usage
```bash
# Install core package
npm install @ingenyus/swarm

# Use in your code
import { ApiGenerator, FeatureGenerator } from '@ingenyus/swarm';
```

### AI Agent Integration
```bash
# Install MCP server
npm install @ingenyus/swarm-mcp

# Start MCP server
swarm-mcp start
```

## Development

This is a pnpm workspace monorepo. Make sure you have pnpm installed:

```bash
npm install -g pnpm
```

### Getting Started

```bash
# Clone the repository
git clone <repository-url>
cd swarm

# Install dependencies for all packages
pnpm install

# Build all packages
pnpm build

# Test all packages  
pnpm test

# Lint all packages
pnpm lint

# Format all packages
pnpm format
```

### Package-Specific Development

```bash
# Work on a specific package
cd packages/swarm-cli
pnpm dev

# Run tests for a specific package
cd packages/swarm
pnpm test

# Build a specific package
cd packages/swarm-mcp
pnpm build
```

### Project Structure

```
swarm/
├── packages/
│   ├── swarm/               # Core shared logic
│   │   ├── src/
│   │   │   ├── generators/  # Code generators
│   │   │   ├── utils/       # Shared utilities
│   │   │   ├── types/       # TypeScript types
│   │   │   └── templates/   # Code templates
│   │   └── tests/           # Unit tests
│   ├── swarm-cli/           # CLI tool
│   │   ├── src/
│   │   │   ├── cli/         # CLI commands
│   │   │   └── types/       # CLI-specific types
│   │   └── test/            # Integration tests
│   └── swarm-mcp/           # MCP server
│       ├── src/
│       │   └── server/      # MCP server implementation
│       └── tests/           # Integration tests
├── scripts/                 # Build and deployment scripts
├── test/                    # Global integration tests
└── tsconfig.base.json       # Shared TypeScript configuration
```

## Contributing

We use [changesets](https://github.com/changesets/changesets) with automatic generation from [conventional commits](https://www.conventionalcommits.org/) for version management and releases. The system uses a modular architecture with shared utilities to maintain consistency and avoid code duplication.

### Making Changes

1. Make your changes to the relevant package(s)
2. Commit using conventional commit format:
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix(core): resolve issue in swarm"
   git commit -m "feat(cli): add new command"
   git commit -m "feat!: breaking change"
   ```
3. Changesets are automatically generated from your commit messages during CI

Alternatively, you can still create changesets manually:
```bash
pnpm changeset
```

### Release Process

Releases are automated through GitHub Actions:
1. When PRs are merged to `main`, a "Version Packages" PR is automatically created
2. Review and merge the version PR to publish the packages to npm

See [MIGRATION_TO_CHANGESETS.md](./MIGRATION_TO_CHANGESETS.md) for more details about our release process.

### Development Guidelines

- Follow the guidelines in [CONTRIBUTING.md](./CONTRIBUTING.md)
- Use TypeScript best practices
- Add tests for new functionality
- Update documentation for new features
- Ensure all existing tests continue to pass

## License

MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for Wasp framework developers**
