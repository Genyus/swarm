# Contributing to Swarm

Thank you for your interest in contributing to Swarm! This document outlines best practices and guidelines to help you make effective, high-quality contributions to any package in the Swarm monorepo.

## Table of Contents
- [Code Style](#code-style)
- [TypeScript & Typing](#typescript--typing)
- [Error Handling](#error-handling)
- [Logging](#logging)
- [Testing](#testing)
- [Package-Specific Guidelines](#package-specific-guidelines)
- [Pull Requests](#pull-requests)

---

## Code Style
- Use [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) for formatting and linting.
- Prefer single responsibility per file/module.
- Use descriptive variable and function names.
- Write JSDoc comments for all exported functions and types.
- Keep imports organized and avoid unused imports.

## TypeScript & Typing
- All code must be written in TypeScript.
- Use strong typing everywhere; avoid `any` unless absolutely necessary.
- Shared types and interfaces belong in `packages/swarm-core/src/types/`.
- Package-specific types belong in the respective package's `src/types/` directory.
- Prefer type aliases and enums for clarity.

## Error Handling
- **Always use the centralized error utility from `@ingenyus/swarm-core`.**
- Do **not** use `console.log`, `console.error`, or `process.exit` directly.
- For user-facing errors, use:
  ```ts
  import { error, handleFatalError } from '@ingenyus/swarm-core';
  error('Something went wrong');
  // or for fatal errors:
  handleFatalError('Critical failure', err);
  ```
- For non-fatal warnings or info:
  ```ts
  import { warn, info, success } from '@ingenyus/swarm-core';
  warn('This is a warning');
  info('This is an info message');
  success('Operation completed successfully');
  ```
- **Debug mode:**
  - If you want to print stack traces, set the environment variable `SWARM_DEBUG=1`.
  - The error utility will automatically print stack traces in debug mode.
- **Validation errors:**
  - Use `error()` and return early from the function/handler.
  - Do not call `process.exit` directly in command handlers.

## Logging
- All logging should use the [signale](https://github.com/klaussinani/signale) logger via the error utility from `@ingenyus/swarm-core`.
- Use the appropriate log level: `info`, `success`, `warn`, `error`.
- Avoid raw `console` statements.

## Testing
- Place unit tests alongside code (e.g., `src/utils/io.test.ts`).
- Place integration/e2e tests in the package's `tests/` directory.
- Write tests for all new features and bug fixes.
- Run tests for the specific package you're working on:
  ```bash
  cd packages/package-name
  pnpm test
  ```
- Run all tests from the monorepo root:
  ```bash
  pnpm test
  ```

## Package-Specific Guidelines

### swarm-core
- This is the foundational package containing shared logic.
- All generators, utilities, and types should be CLI-agnostic.
- Do not include any CLI-specific dependencies (like `commander`).
- Ensure all functionality is well-documented and tested.

### swarm-cli
- CLI-specific logic and command implementations.
- Depends on `@ingenyus/swarm-core` for shared functionality.
- Command registration and CLI-specific types belong here.
- Use Commander.js for CLI argument parsing and validation.

### swarm-mcp
- MCP server implementation for AI agent integration.
- Depends on `@ingenyus/swarm-core` for shared functionality.
- Focus on MCP protocol compliance and AI agent workflows.
- Ensure all MCP tools are properly documented and tested.

### Adding New Packages
- Follow the established package structure in `packages/`.
- Include proper `package.json` with workspace dependencies.
- Add TypeScript configuration and build setup.
- Include comprehensive tests and documentation.
- Update root `pnpm-workspace.yaml` if needed.

### Adding New Features
1. Determine which package the feature belongs to:
   - Core functionality → `swarm-core`
   - CLI-specific → `swarm-cli`
   - MCP-specific → `swarm-mcp`
2. Add the feature to the appropriate package
3. Add any new templates to `packages/swarm-core/src/templates/`
4. Update types in the appropriate `src/types/` directory
5. Add tests for the new functionality
6. Update documentation

## Pull Requests
- Reference the relevant issue or PRD milestone in your PR description.
- Ensure your branch is up to date with `main` before submitting.
- Run all tests and linters before opening a PR:
  ```bash
  pnpm test
  pnpm lint
  pnpm format:check
  ```
- Provide a clear summary of your changes and why they are needed.
- If your changes affect multiple packages, test all affected packages.

### Commit Messages
Use conventional commit format for clear, consistent commit messages:
```bash
# Package-specific commits
git commit -m "feat(core): add new generator"
git commit -m "fix(cli): resolve command parsing issue"
git commit -m "docs(mcp): update API documentation"

# Multi-package commits
git commit -m "feat: add new feature across packages"
git commit -m "fix: resolve shared utility issue"

# Breaking changes
git commit -m "feat!: breaking change in core API"
```

---

Thank you for helping make Swarm better!
