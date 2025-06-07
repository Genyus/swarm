# Contributing to Swarm CLI

Thank you for your interest in contributing to Swarm CLI! This document outlines best practices and guidelines to help you make effective, high-quality contributions.

## Table of Contents
- [Code Style](#code-style)
- [TypeScript & Typing](#typescript--typing)
- [Error Handling](#error-handling)
- [Logging](#logging)
- [Testing](#testing)
- [CLI Patterns](#cli-patterns)
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
- Shared types and interfaces belong in `src/types/`.
- Prefer type aliases and enums for clarity.

## Error Handling
- **Always use the centralized error utility in `src/utils/errors.ts`.**
- Do **not** use `console.log`, `console.error`, or `process.exit` directly.
- For user-facing errors, use:
  ```ts
  import { error, handleFatalError } from '../utils/errors';
  error('Something went wrong');
  // or for fatal errors:
  handleFatalError('Critical failure', err);
  ```
- For non-fatal warnings or info:
  ```ts
  import { warn, info, success } from '../utils/errors';
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
- All logging should use the [signale](https://github.com/klaussinani/signale) logger via the error utility.
- Use the appropriate log level: `info`, `success`, `warn`, `error`.
- Avoid raw `console` statements.

## Testing
- Place unit tests alongside code (e.g., `src/utils/io.test.ts`).
- Place integration/e2e tests in the top-level `/test` directory.
- Write tests for all new features and bug fixes.

## CLI Patterns
- Register new CLI commands in `src/commands/` as a `GeneratorCommand`.
- Keep CLI registration logic separate from core generator logic.
- Use Commander's validation features (e.g., `.requiredOption()`) where possible.
- Extract reusable CLI option helpers to `src/cli/options.ts`.

## Pull Requests
- Reference the relevant issue or PRD milestone in your PR description.
- Ensure your branch is up to date with `main` before submitting.
- Run all tests and linters before opening a PR.
- Provide a clear summary of your changes and why they are needed.

---

Thank you for helping make Swarm CLI better! 