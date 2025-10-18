# Swarm AI Agent Guide

This document provides comprehensive information for AI agents working on the Swarm codebase.

## Project Overview

Swarm is a set of code generation tools for rapid Typescript application development. This is a monorepo using pnpm workspaces with the following key characteristics:

- **Language**: TypeScript (ESM-first)
- **Package Manager**: pnpm (required)
- **Node Version**: ^20.0.0 || ^22.0.0 || >=24.0.0
- **Build System**: Vite
- **Monorepo Structure**: 2 packages in `packages/` directory

## Setup and Development

### Initial Setup
1. Run `pnpm install` to install dependencies
2. Run `pnpm build` to build all packages

### Key Scripts
- `pnpm build` - Build all packages
- `pnpm dev` - Watch mode for development
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm format` - Apply Prettier formatting
- `pnpm format:check` - Check Prettier formatting

## Testing

### Running Tests
- **All tests**: `pnpm test`
- **Specific test suite**: `pnpm test --filter <package-name> <test-file>`

## Project Structure

### Core Packages (`packages/`)
- `swarm` - Base package containing plugin infrastructure, with CLI command and MCP tool generation
- `swarm-wasp` - Plugin containing Wasp entity generators and enhanced configuration

### Test Organization (`packages/*/tests/`)
- Various test suites organised by feature

### Important Directories
- `docs/` - Documentation
- `examples/` - Example projects and integrations
- `scripts/` - Build and development scripts
- `.github/` - GitHub Actions workflows
- `patches/` - Package patches via pnpm

## Code Style and Conventions

### Formatting and Linting
- **Always run** `pnpm lint:fix` after making changes
- Fix non-auto-fixable errors manually

### TypeScript
- Strict TypeScript configuration
- Use `pnpm typecheck` to verify types
- Configuration files: `tsconfig.base.json`, `tsconfig.json`, `tsconfig.dts.json`, `tsconfig.typecheck.json`

### Code Quality
- ESM-first approach
- Follow existing patterns in the codebase

## Common Workflows

### Adding New Features
1. Identify the appropriate package in `packages/`
2. Follow existing code patterns
3. Add tests using testing utilities
4. Run `pnpm build && pnpm typecheck && pnpm lint:fix`
5. Add tests with relevant test suites

### Debugging
- Use VS Code: `⇧⌘B` (Shift+Cmd+B) or `Ctrl+Shift+B` for dev tasks
- Check `scripts/` directory for specialized development tools

## Dependencies and Tools

### Key Dependencies
- **Vite** - Build tool and dev server
- **ESLint** - Linting
- **TypeScript** - Type checking

### Development Tools
- **tsx** - TypeScript execution
- **changesets** - Monorepo versioning
- **Vitest** - testing

## Troubleshooting

### Common Issues
- Ensure pnpm is used (not npm/yarn)
- Build before running tests
- Check Node.js version compatibility

### Getting Help
- Check existing issues and documentation
- Review CONTRIBUTING.md for detailed guidelines
- Follow patterns in existing code
