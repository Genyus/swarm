# @ingenyus/swarm-wasp

Wasp-specific plugins for Swarm - Feature generators, commands, and MCP tools for Wasp development.

## Overview

This package contains all Wasp-specific functionality organized as plugins. Each plugin provides:

- **Generator**: Code generation logic for Wasp features
- **Command**: CLI command implementation
- **MCP Tools**: MCP server tools for IDE integration
- **Templates**: Wasp-specific templates bundled with the plugin

## Plugins

- **Feature**: Feature generation and management
- **API**: API endpoint generation
- **CRUD**: CRUD operation generation
- **Route**: Route generation
- **Job**: Background job generation
- **Operation**: Query and action generation
- **API Namespace**: API namespace and middleware generation

## Usage

This package is designed to be used with the Swarm core system. Plugins are automatically discovered and loaded by the Swarm CLI and MCP server.

## Development

This package is part of the Swarm monorepo. See the main README for development setup instructions.

## License

MIT
