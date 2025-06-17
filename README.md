# Swarm

A powerful TypeScript monorepo containing tools and utilities for Wasp full-stack framework projects.

## Packages

- [`@ingenyus/swarm-cli`](./packages/swarm-cli) - A CLI tool for rapidly generating features, APIs, jobs, CRUD operations, and more

## Development

This is a pnpm workspace monorepo. Make sure you have pnpm installed:

```bash
npm install -g pnpm
```

### Getting Started

```bash
# Install dependencies for all packages
pnpm install

# Build all packages
pnpm build

# Test all packages  
pnpm test

# Lint all packages
pnpm lint
```

## Contributing

We use [changesets](https://github.com/changesets/changesets) with automatic generation from [conventional commits](https://www.conventionalcommits.org/) for version management and releases. The system uses a modular architecture with shared utilities to maintain consistency and avoid code duplication.

### Making Changes

1. Make your changes to the relevant package(s)
2. Commit using conventional commit format:
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix(cli): resolve issue"
   git commit -m "fix(swarm-cli): resolve issue"
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

## License

MIT
