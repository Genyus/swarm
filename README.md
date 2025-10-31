<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Genyus/swarm/HEAD/docs/images/docs/images/swarm-logo-horizontal-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Genyus/swarm/HEAD/docs/images/docs/images/swarm-logo-horizontal.svg">
    <img alt="Swarm - Typescript Code Generator" src="https://raw.githubusercontent.com/Genyus/swarm/HEAD/docs/images/docs/swarm-logo-horizontal.svg" width="350" style="max-width: 100%;">
  </picture>
</p>

# Welcome to Swarm

This monorepo hosts Swarm, a Typescript code generation framework along with related plugins and starter templates.

## Table of Contents

- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Scripts & Tooling](#scripts--tooling)
- [Contributing](#contributing)
- [License](#license)

## Repository Structure

This repository is organised as a monorepo, using pnpm. Key directories include:

- apps/
  - [`swarm-wasp-starter`](./apps/swarm-wasp-starter/): Minimal Wasp starter template
- packages/
  - [`swarm`](./packages/swarm): Core framework including CLI, MCP server, plugin system, and app generator
  - [`swarm-wasp`](./packages/swarm-wasp): [Wasp](https://wasp.sh) component generators, templates, and enhanced configuration

## Getting Started

Install pnpm if you don't have it already:

```bash
npm install -g pnpm
```

Clone, install and validate the project:

```bash
# Clone the repository
git clone <repository-url>
cd swarm

# Install dependencies
pnpm install

# Build, test, lint and format all packages
pnpm validate
```

To integrate Swarm components into your own projects or to extend the framework, see the relevant README files inside specific templates and packages (e.g. `apps/swarm-wasp-starter`, `projects/swarm-wasp`, etc.)

## Scripts & Tooling

- **Monorepo management:** [pnpm](https://pnpm.io/) (`pnpm-workspace.yaml`)
- **Code style and linting:** [ESLint](https://eslint.org), [Prettier](https://prettier.io), [EditorConfig](https://editorconfig.org)
- **Schema management:** [Zod](https://zod.dev)
- **Testing:** [Vitest](https://vitest.dev)
- **CI/CD:** [GitHub Actions](https://docs.github.com/en/actions)

## Contributing

This project uses [changesets](https://github.com/changesets/changesets) with automatic generation via [conventional commits](https://www.conventionalcommits.org/) for version management and releases.

### Making Changes

1. Make your changes to the relevant package(s)
2. Commit using conventional commit format:
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix(swarm): resolve issue in swarm"
   git commit -m "feat(swarm-wasp): add new command"
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
2. The version PR is reviewed and merged to publish the packages to npm

### Development Guidelines

- Follow the guidelines in [CONTRIBUTING.md](./CONTRIBUTING.md)
- Use TypeScript best practices
- Add tests for new functionality
- Update documentation for new features
- Ensure all existing tests continue to pass

## License

MIT License - see the [LICENSE](LICENSE) file for details.
