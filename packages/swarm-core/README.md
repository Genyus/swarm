# @ingenyus/swarm-core

Core Swarm logic - Shared generators, templates, utilities, and types for Wasp development.

## Overview

This package contains the shared logic extracted from the Swarm CLI tool, providing a common foundation for both the CLI and MCP packages. It includes:

- **Generators**: Code generation logic for APIs, features, CRUD operations, jobs, and more
- **Templates**: Handlebars templates for generating code
- **Utilities**: Common utilities for file system operations, logging, and validation
- **Types**: TypeScript type definitions shared across packages

## Installation

```bash
pnpm add @ingenyus/swarm-core
```

## Usage

```typescript
import { ApiGenerator, FeatureGenerator } from '@ingenyus/swarm-core';

// Use generators
const apiGen = new ApiGenerator();
const featureGen = new FeatureGenerator();

// Use utilities
import { FileSystem, Logger } from '@ingenyus/swarm-core';
```

## Development

This package is part of the Swarm monorepo. See the root README for development setup instructions.

## License

MIT
