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
- Shared types and interfaces belong in `packages/swarm/src/types/`.
- Package-specific types belong in the respective package's `src/types/` directory.
- Prefer type aliases and enums for clarity.

## Error Handling
- **Always use the centralised error utility from `@ingenyus/swarm`.**
- Do **not** use `console.log`, `console.error`, or `process.exit` directly.
- For user-facing errors, use:
  ```ts
  import { error, handleFatalError } from '@ingenyus/swarm';
  error('Something went wrong');
  // or for fatal errors:
  handleFatalError('Critical failure', err);
  ```
- For non-fatal warnings or info:
  ```ts
  import { warn, info, success } from '@ingenyus/swarm';
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
- All logging should use the [signale](https://github.com/klaussinani/signale) logger via the error utility from `@ingenyus/swarm`.
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

### swarm
- This is the foundational package containing shared logic.
- Ensure all functionality is well-documented and tested.
- This package includes both the CLI and MCP server implementations.
- CLI command implementation is in `packages/swarm/src/cli/`.
- MCP server implementation is in `packages/swarm/src/mcp/`.
- Use Commander.js for CLI argument parsing and validation.
- Focus on MCP protocol compliance and AI agent workflows for MCP features.

### swarm-wasp
- This is a plugin containing Wasp-specific functionality
- This package includes generators for all documented Wasp components and a custom configuration class
- All generators inherit the `GeneratorBase` class from the `swarm` package 

### Adding New Packages
- Follow the established package structure in `packages/`.
- Include proper `package.json` with workspace dependencies.
- Add TypeScript configuration and build setup.
- Include comprehensive tests and documentation.
- Update root `pnpm-workspace.yaml` if needed.

### Adding New Features
1. Determine which package the feature belongs to:
   - Core functionality → `packages/swarm/`
   - Wasp-specific → `packages/swarm-wasp/`
2. Add the feature to the appropriate package
3. Update types in the appropriate `src/types/` directory
4. Add tests for the new functionality
5. Update documentation

## Pull Requests
- Reference the relevant issue or PRD milestone in your PR description.
- Ensure your branch is up to date with `main` before submitting.
- Validate the codebase (runs tests, linter, formatter, etc) before opening a PR:
```bash
pnpm validate
```
- Provide a clear summary of your changes and why they are needed.
- If your changes affect multiple packages, test all affected packages.

### Commit Messages
Use [Conventional Commits](http://conventionalcommits.org/en/v1.0.0/) format for clear, consistent commit messages:
```bash
# Package-specific commits
git commit -m "feat(wasp): add new feature to CRUD generator"
git commit -m "fix(swarm): resolve command parsing issue"
git commit -m "docs(wasp): update API documentation"

# Multi-package commits
git commit -m "feat: add new feature across packages"
git commit -m "fix: resolve shared utility issue"

# Breaking changes
git commit -m "feat!: breaking change in core API"
```

If you wish to include a scope, you should provide the package name your changes relate to. Alternatively, to save characters, you can specify the package suffix alone (e.g. `wasp` == `swarm-wasp`).

### Changesets

This CI workflow for this project automatically generates [Changesets](https://github.com/changesets/changesets) from conventional commit messages when your PR is merged. You don't need to create them manually unless you want more control over the changelog entry.

#### Automatic generation

- CI processes conventional commit messages (e.g., `feat:`, `fix:`, `feat!:`) and generates changesets automatically
- Simply use [Conventional Commits](#commit-messages) format in your commits
- Changesets are created for changes to individual packages (`@ingenyus/swarm` or `@ingenyus/swarm-wasp`)
- When a scope isn't provided in the commit message, the workflow will examine the included file paths to determine which packages are affected
- Test, documentation, build, CI or chore-only changes typically don't require changesets

#### Manual changeset creation (optional)

If you want more control over the changelog entry or to provide additional context, you can create a changeset manually:

1. Run the changeset command from the monorepo root:
   ```bash
   pnpm changeset
   ```

2. You'll be prompted to:
   - Select which packages are affected (`@ingenyus/swarm`, `@ingenyus/swarm-wasp`, or both)
   - Choose the change type:
     - `major` - Breaking changes
     - `minor` - New features
     - `patch` - Bug fixes or minor improvements
   - Write a description of the changes (this will appear in the CHANGELOG)

3. Commit the generated changeset file (it will be in `.changeset/`) along with your code changes

**Note:** Manual changesets take precedence over auto-generated ones, so if you create one, it will be used instead of generating from commit messages.

---

Thank you for helping make Swarm better!
