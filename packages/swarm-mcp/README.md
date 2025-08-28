# Swarm MCP Server

A Model Context Protocol (MCP) server that provides programmatic access to Swarm CLI capabilities, enabling AI agents to generate Wasp application code.

## Overview

The Swarm MCP Server bridges the gap between AI development workflows and Swarm's code generation capabilities. It exposes Swarm CLI operations through a standardized MCP interface, allowing AI agents to programmatically generate Wasp application code.

## Features

- **MCP Protocol Compliance**: Full compliance with MCP v1.0 specification
- **Swarm CLI Integration**: Access to all major Swarm CLI commands (api, feature, crud, job, operation, route)
- **Filesystem Operations**: Safe file reading, writing, and management
- **Local Development Focus**: Designed for secure local development environments
- **TypeScript Support**: Built with TypeScript for type safety and developer experience

## Installation

```bash
npm install swarm-mcp
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

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
npm install
npm run build
npm test
```

### Scripts

- `npm run build` - Build the TypeScript code
- `npm run dev` - Watch mode for development
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## License

MIT
