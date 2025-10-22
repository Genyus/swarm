# @ingenyus/swarm

An extensible code generation framework for JavaScript and TypeScript projects. Built with extensibility in mind, Swarm uses a plugin architecture that allows developers to create generators for different types of content, whilst starter repositories define the structure and scaffolding for various project types.

Swarm provides both CLI commands and AI agent integration via MCP (Model Context Protocol) to create customised boilerplate code and scaffold new projects.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [CLI Commands](#cli-commands)
- [MCP Integration](#mcp-integration)
- [Known Plugins](#known-plugins)
- [Known Starter Repositories](#known-starter-repositories)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Installation

Swarm is designed to be used primarily as a CLI tool. You can run it directly without installation:

```bash
npx @ingenyus/swarm create my-project
```

For plugin development, you can install Swarm as a library:

```bash
npm install @ingenyus/swarm
```

See our [plugin development documentation](https://github.com/genyus/swarm/tree/main/docs) for detailed guidance on creating custom generators.

## Quick Start

Create a new project from a starter template:

```bash
# Create a new project from a starter template
npx @ingenyus/swarm create my-app --template user/custom-starter
```

This will clone the template repository into the project directory and replace project-specific placeholders.

## How It Works

Swarm operates through a flexible plugin architecture:

- **Plugins** define generators for different types of content (APIs, components, configurations, etc.)
- **Generators** create specific files and boilerplate code within the host project
- **Starter repositories** define project scaffolding and initial structure
- **Configuration files** enable or disable specific plugins and generators for a project

Swarm commands are built dynamically from the available plugins and their generators, allowing you to create boilerplate code tailored to each project. The `create` command scaffolds entire projects from starter templates, whilst individual generators add specific functionality to existing projects.

## CLI Commands

### `create`

Creates a new project from a template Git repository.

```bash
npx @ingenyus/swarm create <project-name> [options]
```

**Arguments:**
- `<project-name>` - Name for your project (used for directory and package name)

**Options:**
- `-t, --template <template>` - GitHub repository path or Git URL to use as the project template
- `-d, --target-dir [target-dir]` - Target directory (defaults to project name)

**Examples:**

```bash
# Create with a custom template
npx @ingenyus/swarm create my-app --template user/custom-starter

# Create in a specific directory
npx @ingenyus/swarm create my-app --template genyus/swarm-wasp-starter --target-dir ./projects/my-app
```

## MCP Integration

Swarm includes an MCP (Model Context Protocol) server that allows AI tools to interact with generators directly. This enables AI assistants like Cursor, Claude Code, or VS Code Copilot to generate boilerplate code and scaffold projects on your behalf.

**Connecting AI Tools:**
- Configure your AI tool to connect to Swarm's MCP server
- The server exposes generators as tools that AI agents can use
- AI tools can then generate code, create files, and scaffold projects automatically

For detailed MCP setup instructions, see our [MCP integration guide](https://github.com/genyus/swarm/tree/main/docs/mcp).

## Known Plugins

### `@ingenyus/swarm-wasp`
Generators for the Wasp full-stack framework, including API endpoints, CRUD operations, routes, background jobs, and more. [View on GitHub](https://github.com/genyus/swarm/tree/main/packages/swarm-wasp)

## Known Starter Repositories

### `genyus/swarm-wasp-starter`
A minimal Wasp starter template with Swarm integration, shadcn/ui components, and Tailwind CSS. Perfect for building full-stack applications with modern tooling. [View on GitHub](https://github.com/genyus/swarm-wasp-starter)

## Development

### Prerequisites

- Node.js 18+
- TypeScript 5+

### Setup

```bash
# Clone and install dependencies
git clone https://github.com/genyus/swarm.git
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
│   └── app/              # App generator for project scaffolding
├── cli/                  # Command-line interface
├── mcp/                  # MCP server for AI tool integration
├── plugin/               # Plugin system
├── common/                # Shared utilities
│   ├── strings.ts        # String manipulation
│   ├── logger.ts         # Logging utilities
│   └── errors.ts         # Error handling
├── types/                # TypeScript type definitions
└── contracts/            # Plugin and generator interfaces
```

The core architecture consists of:

- **Generator System** - Base classes and interfaces for creating custom generators
- **Plugin Framework** - System for loading and managing generator plugins
- **CLI Interface** - Command-line tools for direct interaction
- **MCP Server** - Protocol server for AI tool integration
- **Template System** - Flexible templating for code generation

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Make your changes and add tests
4. Ensure all validation checks pass: `pnpm validate`
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature/my-new-feature`
7. Submit a pull request

### Guidelines

- Follow TypeScript best practices
- Add tests for new functionality
- Update documentation for new features
- Use Conventional Commits commit messages
- Ensure all existing tests continue to pass

## License

MIT License - see the [LICENSE](LICENSE) file for details.
