# Plugin Development Guide

This guide explains how to create custom plugins for Swarm that generate code for your specific framework or tooling needs.

## Table of Contents

- [Overview](#overview)
- [Plugin Architecture](#plugin-architecture)
- [Creating a Plugin](#creating-a-plugin)
- [Creating Generators](#creating-generators)
- [Generator Base Classes](#generator-base-classes)
- [Schema Definition](#schema-definition)
- [Template System](#template-system)
- [Best Practices](#best-practices)
- [Testing Your Plugin](#testing-your-plugin)
- [Publishing Your Plugin](#publishing-your-plugin)
- [Sharing Your Plugin](#sharing-your-plugin)

## Overview

A Swarm plugin is a package that exports one or more **generators** - code generation functions that create files and boilerplate code for your project. Plugins enable Swarm to work with any framework, library, or tooling setup.

### Key Concepts

- **Plugin**: A container for related generators with shared configuration
- **Generator**: A code generation function that creates specific files based on input parameters
- **Schema**: A Zod schema that validates generator parameters and generates CLI help text
- **Template**: An ETA template file used to generate code files

## Plugin Architecture

### Plugin Interface

Plugins must implement the `Plugin` interface:

```typescript
import { GeneratorProvider } from '@ingenyus/swarm';

export interface Plugin {
  /** Unique plugin name */
  name: string;
  /** Array of {@link GeneratorProvider `GeneratorProvider`} instances */
  generators: Array<GeneratorProvider>;
}
```

### Generator Interface

Generators must implement the `Generator` interface:

```typescript
import { Generator } from '@ingenyus/swarm';

export interface Generator<S extends ZodType = ZodType> {
  /** Unique generator name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Zod schema for validation and help generation */
  schema: S;
  /** Generate code from validated parameters */
  generate: (args: Out<S>) => Promise<void>;
}
```

## Creating a Plugin

### Step 1: Project Setup

Create a new npm package for your plugin:

```bash
mkdir swarm-myframework
cd swarm-myframework
npm init -y
```

Install Swarm as a peer dependency:

```bash
npm install --save-peer @ingenyus/swarm
npm install --save-dev typescript zod @types/node
```

### Step 2: Create Plugin Structure

```
swarm-myframework/
├── src/
│   ├── index.ts              # Plugin export
│   ├── generators/
│   │   ├── component/
│   │   │   ├── component-generator.ts
│   │   │   ├── schema.ts
│   │   │   └── templates/
│   │   │       └── component.eta
│   │   └── index.ts
│   └── types.ts
├── package.json
└── tsconfig.json
```

### Step 3: Define Your Plugin

Create `src/index.ts`:

```typescript
import { Plugin } from '@ingenyus/swarm';
import { ComponentGenerator, componentSchema } from './generators';

export const myframework: Plugin = {
  name: 'myframework',
  version: '1.0.0',
  description: 'Swarm plugin for MyFramework',
  providers: [
    defineGeneratorProvider({
      schema: componentSchema,
      create: (services) => new ComponentGenerator(services),
    }),
    // Add more generators here
  ],
};
```

### Step 4: Configure Package.json

Update `package.json`:

```json
{
  "name": "@your-org/swarm-myframework",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "peerDependencies": {
    "@ingenyus/swarm": "^0.2.0"
  }
}
```

### Example

See the [`@ingenyus/swarm-wasp`](../packages/swarm-wasp) package for a complete example that includes:

- Multiple generators (API, CRUD, Actions, Queries, Routes, etc.)
- Custom base classes
- Template system integration
- Configuration file updates
- Comprehensive testing

## Creating Generators

### Basic Generator Example

Here's a minimal generator that creates a component file:

```typescript
import { GeneratorBase, Out, toPascalCase } from '@ingenyus/swarm';
import { z } from 'zod';
import { FileSystem, Logger } from '@ingenyus/swarm';

const schema = z.object({
  name: z.string().min(1, 'Component name is required'),
  path: z.string().optional(),
});

export class ComponentGenerator extends GeneratorBase<typeof schema> {
  name = 'component';
  description = 'Generates a MyFramework component';
  schema = schema;

  async generate(args: Out<typeof schema>): Promise<void> {
    const componentName = toPascalCase(args.name);
    const targetPath = args.path || `src/components/${componentName}.tsx`;
    
    const content = this.generateComponentCode(componentName);
    
    this.fileSystem.writeFileSync(targetPath, content);
    this.logger.success(`Generated component: ${targetPath}`);
  }

  private generateComponentCode(name: string): string {
    return `export function ${name}() {
  return <div>${name}</div>;
}
`;
  }
}
```

### Using GeneratorBase

`GeneratorBase` provides helpful utilities:

```typescript
import { GeneratorBase, Out } from '@ingenyus/swarm';
import { z } from 'zod';

export class MyGenerator extends GeneratorBase<typeof schema> {
  // Required properties
  name = 'my-generator';
  description = 'My generator description';
  schema = schema;

  async generate(args: Out<typeof schema>): Promise<void> {
    // Wrap generation logic in error handler
    return this.handleGeneratorError('Component', args.name, async () => {
      // Your generation logic here
      const content = this.generateCode(args);
      this.fileSystem.writeFileSync(targetPath, content);
    });
  }
}
```

### GeneratorBase Methods

- `handleGeneratorError<T>(itemType, itemName, fn)`: Wraps generation logic with error handling
- `validate(params)`: Validates parameters against schema
- `generateHelp()`: Generates help text from schema metadata
- `logCompletion(itemType, itemName)`: Logs completion message

## Generator Base Classes

For framework-specific plugins, you can create custom base classes that extend `GeneratorBase`:

```typescript
import { GeneratorBase, FileSystem, Logger } from '@ingenyus/swarm';
import { ZodType } from 'zod';
import { TemplateResolver, TemplateUtility } from './utils';

export abstract class MyFrameworkGeneratorBase<S extends ZodType> 
  extends GeneratorBase<S> {
  
  protected templateResolver: TemplateResolver;
  protected templateUtility: TemplateUtility;

  constructor(
    fileSystem: FileSystem = defaultFileSystem,
    logger: Logger = defaultLogger
  ) {
    super(fileSystem, logger);
    this.templateResolver = new TemplateResolver(fileSystem);
    this.templateUtility = new TemplateUtility(fileSystem);
  }

  /**
   * Get the default template path for this generator
   */
  protected abstract getDefaultTemplatePath(templateName: string): string;

  /**
   * Resolve template path with custom template override support
   */
  protected async getTemplatePath(templateName: string): Promise<string> {
    const defaultPath = this.getDefaultTemplatePath(templateName);
    // Check for custom templates in swarm.config.json
    // Return resolved path
    return defaultPath;
  }

  /**
   * Render template to file
   */
  protected async renderTemplateToFile(
    templateName: string,
    data: Record<string, any>,
    outputPath: string,
    force: boolean = false
  ): Promise<void> {
    const templatePath = await this.getTemplatePath(templateName);
    const content = this.templateUtility.processTemplate(templatePath, data);
    
    if (this.fileSystem.existsSync(outputPath) && !force) {
      throw new Error(`File exists: ${outputPath}. Use --force to overwrite.`);
    }
    
    this.fileSystem.writeFileSync(outputPath, content);
    this.logger.success(`Generated: ${outputPath}`);
  }
}
```

## Schema Definition

Schemas use Zod with Swarm's command registry for CLI metadata:

```typescript
import { commandRegistry } from '@ingenyus/swarm';
import { z } from 'zod';

export const schema = z.object({
  // Required string field
  name: z
    .string()
    .min(1, 'Name is required')
    .meta({ description: 'The name of the component' })
    .register(commandRegistry, {
      shortName: 'n',
      examples: ['Button', 'UserCard'],
      helpText: 'Must be a valid component name',
    }),

  // Optional path field
  path: z
    .string()
    .optional()
    .meta({ description: 'Output path for the component' })
    .register(commandRegistry, {
      shortName: 'p',
      examples: ['src/components', 'app/components'],
    }),

  // Boolean flag
  withStyles: z
    .boolean()
    .optional()
    .default(false)
    .meta({ description: 'Include CSS styles' })
    .register(commandRegistry, {
      shortName: 's',
      helpText: 'Generates a separate CSS file',
    }),

  // Enum field
  type: z
    .enum(['page', 'component', 'layout'])
    .meta({ description: 'Component type' })
    .register(commandRegistry, {
      examples: ['page', 'component', 'layout'],
    }),
});
```

### Schema Metadata

- `.meta({ description })`: Sets field description for help text
- `.register(commandRegistry, {...})`: Registers CLI metadata:
  - `shortName`: Short flag (e.g., `-n`)
  - `examples`: Example values
  - `helpText`: Additional help text
  - `defaultValue`: Default value

## Template System

Swarm uses [ETA](https://eta.js.org/) templates for code generation. Templates support custom template directories via `swarm.config.json`.

### Basic Template Example

Create `templates/component.eta`:

```eta
export function <%= it.componentName %>() {
  return (
    <div className="<%= it.className %>">
      <h1><%= it.title %></h1>
      <% if (it.withStyles) { %>
      <style jsx>{`
        .<%= it.className %> {
          padding: 1rem;
        }
      `}</style>
      <% } %>
    </div>
  );
}
```

### Using Templates in Generators

```typescript
async generate(args: Out<typeof schema>): Promise<void> {
  const templatePath = await this.getTemplatePath('component.eta');
  const content = this.templateUtility.processTemplate(templatePath, {
    componentName: toPascalCase(args.name),
    className: toKebabCase(args.name),
    title: args.title || args.name,
    withStyles: args.withStyles || false,
  });
  
  this.fileSystem.writeFileSync(targetPath, content);
}
```

### Custom Template Directories

Users can override templates by setting `templateDirectory` in `swarm.config.json`:

```json
{
  "templateDirectory": ".swarm/templates",
  "plugins": [...]
}
```

Templates should be organized as:
```
.swarm/templates/
  <plugin-name>/
    <generator-name>/
      <template-name>.eta
```

## Best Practices

### 1. Error Handling

Always wrap generation logic in error handlers:

```typescript
async generate(args: Out<typeof schema>): Promise<void> {
  return this.handleGeneratorError('Component', args.name, async () => {
    // Generation logic
  });
}
```

### 2. File Existence Checks

Check if files exist before writing:

```typescript
const targetPath = `src/components/${args.name}.tsx`;

if (this.fileSystem.existsSync(targetPath) && !args.force) {
  throw new Error(`File exists: ${targetPath}. Use --force to overwrite.`);
}
```

### 3. Path Utilities

Use Swarm's path utilities:

```typescript
import { toCamelCase, toPascalCase, toKebabCase } from '@ingenyus/swarm';

const camelName = toCamelCase('my-component'); // 'myComponent'
const pascalName = toPascalCase('my-component'); // 'MyComponent'
const kebabName = toKebabCase('MyComponent'); // 'my-component'
```

### 4. Logging

Use the logger for consistent output:

```typescript
this.logger.info('Starting generation...');
this.logger.success('Generated component: src/Component.tsx');
this.logger.error('Generation failed');
this.logger.warn('File already exists');
```

### 5. Schema Validation

Let Zod handle validation - don't manually validate:

```typescript
// ✅ Good - Zod handles validation
const schema = z.object({
  name: z.string().min(1),
});

// ❌ Bad - redundant validation
async generate(args: any) {
  if (!args.name || args.name.length === 0) {
    throw new Error('Name required');
  }
}
```

### 6. Type Safety

Use TypeScript types from schema:

```typescript
import { Out } from '@ingenyus/swarm';

async generate(args: Out<typeof schema>): Promise<void> {
  // args is fully typed based on your schema
  const name: string = args.name; // ✅ Type-safe
}
```

## Testing Your Plugin

### Unit Testing Generators

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MockFileSystem, MockLogger } from '@ingenyus/swarm';
import { ComponentGenerator } from './component-generator';

describe('ComponentGenerator', () => {
  let generator: ComponentGenerator;
  let fileSystem: MockFileSystem;
  let logger: MockLogger;

  beforeEach(() => {
    fileSystem = new MockFileSystem();
    logger = new MockLogger();
    generator = new ComponentGenerator(fileSystem, logger);
  });

  it('should generate component file', async () => {
    await generator.generate({ name: 'Button' });
    
    expect(fileSystem.writeFileSync).toHaveBeenCalledWith(
      'src/components/Button.tsx',
      expect.stringContaining('export function Button')
    );
  });

  it('should validate required fields', () => {
    const result = generator.validate({});
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('name: Required');
  });
});
```

### Integration Testing

Test your plugin with a real Swarm configuration:

```typescript
import { PluginManager } from '@ingenyus/swarm';

it('should load plugin and generate code', async () => {
  const manager = new PluginManager();
  await manager.initialize('./test/swarm.config.json');
  
  const generators = manager.getEnabledGenerators();
  expect(generators).toHaveLength(1);
  expect(generators[0].name).toBe('component');
});
```

## Publishing Your Plugin

### 1. Build Your Plugin

Configure TypeScript compilation:

```json
{
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  }
}
```

### 2. Export Your Plugin

Ensure your `package.json` exports are correct:

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### 3. Publish to npm

```bash
npm publish --access public
```

### 4. Document Usage

Create a README explaining how to use your plugin:

```markdown
# @your-org/swarm-myframework

Swarm plugin for MyFramework.

## Installation

    ```bash
    npm install @your-org/swarm-myframework
    ```

## Configuration

Add to `swarm.config.json`:

    ```json
    {
      "plugins": [
        {
          "import": "myframework",
          "from": "@your-org/swarm-myframework"
        }
      ]
    }
    ```

## Usage

    ```bash
    npx @ingenyus/swarm generate component Button
    ```
```

## Sharing Your Plugin

Created a useful Swarm plugin? Add it to [the list](../README.md#community-contributions) — PRs welcome!
