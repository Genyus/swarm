# @ingenyus/swarm-mcp

A Model Context Protocol (MCP) server that provides programmatic access to Swarm code generation capabilities, enabling AI agents to generate Wasp application code.

## Overview

The Swarm MCP Server bridges the gap between AI development workflows and Swarm's code generation capabilities. It exposes Swarm operations through a standardized MCP interface, allowing AI agents to programmatically generate Wasp application code.

## Features

- **MCP Protocol Compliance**: Full compliance with MCP v1.0 specification
- **Swarm Integration**: Access to all major Swarm generators (api, feature, crud, job, operation, route)
- **Filesystem Operations**: Safe file reading, writing, and management
- **Local Development Focus**: Designed for secure local development environments
- **TypeScript Support**: Built with TypeScript for type safety and developer experience

## Installation

```bash
npm install @ingenyus/swarm-mcp
# or
yarn add @ingenyus/swarm-mcp
# or
pnpm add @ingenyus/swarm-mcp
```

## Usage

### Starting the MCP Server

```bash
swarm-mcp start
```

### CLI Commands

- `swarm-mcp start` - Start the MCP server
- `swarm-mcp stop` - Stop the MCP server
- `swarm-mcp status` - Check server status

## 📚 Documentation

- **[Getting Started](./docs/GETTING_STARTED.md)** - Quick start guide for AI-enabled development
- **[MCP Configuration Guide](./docs/MCP_CONFIGURATION.md)** - Complete setup guide for AI-enabled editors
- **[API Reference](./docs/API.md)** - Complete API documentation with examples
- **[Usage Examples](./docs/EXAMPLES.md)** - Practical workflows and patterns
- **[Troubleshooting Guide](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Documentation Index](./docs/README.md)** - Overview of all available docs

## Development

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Setup

This package is part of the Swarm monorepo. For development setup:

```bash
# Clone the repository
git clone <repository-url>
cd swarm

# Install dependencies for all packages
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Package-specific Scripts

```bash
# Navigate to the MCP package
cd packages/swarm-mcp

# Build the TypeScript code
pnpm build

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Run linter
pnpm lint

# Format code
pnpm format
```

### Project Structure

```
packages/swarm-mcp/
├── src/
│   ├── server/             # MCP server implementation
│   │   ├── tools/          # MCP tool implementations
│   │   ├── services/       # Business logic services
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── index.ts            # Main entry point
├── tests/                  # Test files
│   └── integration/        # Integration tests
├── docs/                   # Documentation
└── dist/                   # Built output
```

## Testing

The package includes comprehensive test coverage:

```bash
# Run all tests
pnpm test

# Run specific test files
pnpm test tests/integration/api-generation.test.ts

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage
pnpm test -- --coverage
```

### Test Structure

- **Unit Tests**: Located alongside source files
- **Integration Tests**: Located in `tests/integration/` directory
- **Comprehensive coverage** of all MCP tools and services

## Contributing

This package is part of the Swarm monorepo. See the root [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines and contribution instructions.

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
