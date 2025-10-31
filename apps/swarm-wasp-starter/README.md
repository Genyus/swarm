# Swarm Wasp Starter

A production-ready Wasp starter template powered by the Swarm code generation framework.

## Overview

This starter template demonstrates how to build modern Wasp applications using Swarm's code generation functionality. It's designed as a foundation for creating starter templates rather than a complete application, providing minimal but well-structured code that showcases Swarm's features.

**Built with:**
- Swarm generator framework for dynamic code generation
- Swarm Wasp plugin for Wasp-specific generators
- Feature-based architecture with consistent directory structure and file content
- Type-safe Wasp configuration with fluent API
- shadcn/ui components and Tailwind CSS for styling
- MCP integration for AI-assisted development

## What's Included

- **Enhanced App Class**: Fluent API for Wasp configuration with helper methods
- **Feature-Based Structure**: Organised directory layout implemented by the Swarm Wasp plugin
- **Swarm Generators**: All generators available for rapid development
- **Development Scripts**: Comprehensive npm scripts for Wasp workflows
- **MCP Integration**: Ready for AI-assisted development
- **Modern UI**: shadcn/ui components with Tailwind CSS
- **Type Safety**: Complete TypeScript support throughout

## Directory Structure

The template implements the feature-based directory structure defined by the Swarm Wasp plugin:

```
src/
├── features/
│   └── root/                    # Example feature
│       ├── root.wasp.ts         # Feature configuration
│       └── client/
│           └── pages/
│               └── Home.tsx     # Example page component
├── shared/
│   └── client/
│       ├── components/          # Shared React components
│       │   ├── Layout.tsx       # Main layout component
│       │   ├── Header.tsx       # Header component
│       │   ├── Footer.tsx       # Footer component
│       │   └── ui/              # shadcn/ui components
│       ├── hooks/               # Custom React hooks
│       │   ├── useTheme.tsx     # Theme management
│       │   └── useMobile.ts     # Mobile detection
│       └── lib/
│           └── utils.ts         # Utility functions
├── main.wasp.ts                 # Main Wasp configuration
└── schema.prisma                # Database schema
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Wasp CLI installed globally

### Installation

1. **Create a new project from this template:**
   ```bash
   npx @ingenyus/swarm create my-app --template genyus/swarm-wasp-starter
   ```

2. **Navigate to your project:**
   ```bash
   cd my-app
   ```

3. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## Generating Code

### Comprehensive Example

Let's build a complete user management feature to demonstrate Swarm's capabilities:

1. **Create the feature:**
   ```bash
   npm run swarm feature user-management --description "User management feature"
   ```

2. **Add a dashboard route:**
   ```bash
   npm run swarm route dashboard --feature user-management --path /dashboard --auth
   ```

3. **Create user CRUD operations:**
   ```bash
   npm run swarm crud users --feature user-management --dataType User
   ```

4. **Add an API endpoint:**
   ```bash
   npm run swarm api getUserStats --feature user-management --method GET --route /api/user-stats --auth
   ```

5. **Create a background job:**
   ```bash
   npm run swarm job sendWelcomeEmail --feature user-management --cron "0 9 * * *" --entities User
   ```

6. **Add a query operation:**
   ```bash
   npm run swarm operation getUserProfile --feature user-management --type query --entities User --auth
   ```

This creates a complete feature with:
- Dashboard page with authentication
- Full CRUD operations for users
- API endpoint for user statistics
- Background job for welcome emails
- Query for user profiles

### Available Generators

All Swarm Wasp generators are available:

- **`feature`** - Create feature directories and structure
- **`api`** - Generate API endpoints with optional middleware
- **`crud`** - Create complete CRUD operations for entities
- **`route`** - Generate routes and pages with authentication
- **`job`** - Create background jobs with cron scheduling
- **`operation`** - Generate queries and actions
- **`api-namespace`** - Create API namespaces with middleware
- **`config`** - Generate Wasp configuration files

For detailed generator documentation, see the [Swarm Wasp Plugin README](../swarm/packages/swarm-wasp/README.md).

## AI-Assisted Development

The template includes full MCP (Model Context Protocol) integration for AI-assisted development.

### Setup

1. **Start the MCP server:**
   ```bash
   npm run swarm:mcp
   ```

2. **Configure your AI tool** (see [MCP Setup Guide](../swarm/docs/MCP_SETUP.md))

3. **Use AI prompts like:**
   ```
   "Create a task management feature with a dashboard, task CRUD operations, and a daily reminder job"
   ```

   ```
   "Generate an API endpoint for getting user tasks with authentication required"
   ```

   ```
   "Add a new route for the settings page that requires authentication"
   ```

## Type-Safe Wasp Configuration

The template uses the enhanced `App` class from the Swarm Wasp plugin, providing a fluent API for type-safe Wasp configuration:

```typescript
import { App } from "@ingenyus/swarm-wasp";

const app = await App.create("swarm-wasp-starter", {
  title: "Swarm Wasp Starter",
  wasp: { version: "^0.18.1" },
  head: [
    '<meta name="description" content="Swarm Wasp Starter description">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta charset="UTF-8">',
  ],
});

app.client({
  rootComponent: {
    importDefault: "Layout",
    from: "@src/shared/client/components/Layout",
  },
});

export default app;
```

### Helper Methods

The enhanced `App` class provides convenient helper methods:

```typescript
// Add routes with automatic component imports
app.addRoute("dashboard", "DashboardRoute", { 
  path: "/dashboard", 
  auth: true 
});

// Create API endpoints with middleware support
app.addApi("dashboard", "getStats", { 
  method: "GET", 
  route: "/api/stats", 
  auth: true 
});

// Add CRUD operations with custom overrides
app.addCrud("dashboard", "users", { 
  entity: "User",
  getAll: { isPublic: false },
  create: { auth: true }
});

// Create background jobs with cron scheduling
app.addJob("dashboard", "sendReport", { 
  cron: "0 9 * * 1",  // Every Monday at 9 AM
  entities: ["User", "Task"]
});
```

## Package Scripts

The template includes comprehensive npm scripts for Wasp development:

### Development Scripts
- **`dev`**, **`start`** - Start the Wasp development server
- **`start:wasp`** - Start Wasp with TypeScript setup
- **`start:db`** - Start the database only

### Reset Scripts
- **`reset`**, **`rs`** - Reset Wasp (clean + ts-setup)
- **`reset:wasp`**, **`rsw`** - Full Wasp reset without starting
- **`reset:db`**, **`rsd`** - Reset and migrate database
- **`reset:all`**, **`rta`** - Reset both Wasp and database

### Rebuild Scripts
- **`rebuild`**, **`rb`** - Rebuild Wasp project
- **`rebuild:wasp`**, **`rbw`** - Clean and rebuild Wasp
- **`rebuild:db`**, **`rbd`** - Reset database migrations
- **`rebuild:all`**, **`rba`** - Rebuild everything

### Restart Scripts
- **`restart`**, **`rt`** - Restart Wasp development server
- **`restart:wasp`**, **`rtw`** - Restart Wasp with reset
- **`restart:db`**, **`rtd`** - Restart database

### Swarm Scripts
- **`swarm`** - Run Swarm CLI commands
- **`swarm:mcp`** - Start Swarm MCP server

### Code Quality Scripts
- **`lint`** - Run ESLint
- **`lint:fix`** - Fix ESLint issues automatically
- **`format`** - Format code with Prettier
- **`format:check`** - Check Prettier formatting
- **`typecheck`** - Run TypeScript type checking
- **`validate`** - Run all quality checks

### Utility Scripts
- **`add-ui`** - Add shadcn/ui components

## Customisation

### Adding shadcn/ui Components

The template includes a script for adding shadcn/ui components:

```bash
npm run add-ui
```

This will prompt you to select components to add to your project.

### Custom Templates

Override Swarm generator templates by placing custom versions in:

```
.swarm/templates/wasp/
├── api/
│   └── api.eta
├── crud/
│   └── crud.eta
└── route/
    └── page.eta
```

### Configuration

Customise Swarm generators via `swarm.config.json`:

```json
{
  "plugins": {
    "@ingenyus/swarm-wasp": {
      "plugin": "wasp",
      "enabled": true,
      "generators": {
        "api": { "enabled": true },
        "crud": { "enabled": true },
        "route": { "enabled": true }
      }
    }
  }
}
```

## Next Steps

1. **Explore the generators** - Try different Swarm generators to understand their capabilities
2. **Set up MCP** - Configure AI tool integration for enhanced development
3. **Customise the template** - Add your own components and styling
4. **Create your features** - Build your application using the feature-based structure
5. **Deploy** - Use Wasp's deployment features to host your application

## Resources

- [Swarm Documentation](../swarm/README.md)
- [Swarm Wasp Plugin](../swarm/packages/swarm-wasp/README.md)
- [Plugin Development Guide](../swarm/docs/PLUGIN_DEVELOPMENT.md)
- [MCP Setup Guide](../swarm/docs/MCP_SETUP.md)
- [Wasp Documentation](https://wasp-lang.dev/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## License

MIT
