# Generator Examples for Popular Frameworks

This document suggests useful generator examples that could be built as Swarm plugins for popular frameworks like Next.js, Astro, Remix, and others. These examples serve as inspiration for plugin developers.

## Table of Contents

- [Next.js](#nextjs)
- [Astro](#astro)
- [Remix](#remix)
- [SvelteKit](#sveltekit)
- [Nuxt.js](#nuxtjs)
- [React Native](#react-native)
- [Express.js](#expressjs)
- [Fastify](#fastify)
- [tRPC](#trpc)
- [General Patterns](#general-patterns)

## Next.js

### Page Generator

Generates Next.js pages with proper file structure and metadata.

**Features:**
- App Router and Pages Router support
- Server/Client component options
- Metadata configuration
- Route parameters handling
- Loading and error boundaries

**Example Usage:**
```bash
npx @ingenyus/swarm generate page products/[id] --app-router --server
npx @ingenyus/swarm generate page about --pages-router --client
```

**Files Generated:**
- `app/products/[id]/page.tsx` (App Router)
- `pages/products/[id].tsx` (Pages Router)
- Optional `loading.tsx` and `error.tsx`

### API Route Generator

Creates Next.js API routes with TypeScript types and error handling.

**Features:**
- HTTP method selection (GET, POST, PUT, DELETE)
- Request/Response type generation
- Authentication middleware
- Error handling patterns
- OpenAPI schema generation

**Example Usage:**
```bash
npx @ingenyus/swarm generate api-route /api/users --method POST --auth
npx @ingenyus/swarm generate api-route /api/products --method GET
```

**Files Generated:**
- `app/api/users/route.ts` or `pages/api/users.ts`
- Optional types file
- Optional middleware file

### Component Generator

Generates React components with Next.js conventions.

**Features:**
- Server/Client component variants
- CSS Modules or Tailwind support
- Props type generation
- Storybook stories
- Test file generation

**Example Usage:**
```bash
npx @ingenyus/swarm generate component UserCard --server --tailwind
npx @ingenyus/swarm generate component Button --client --css-modules --storybook
```

### Layout Generator

Creates layout components with metadata and structure.

**Features:**
- Metadata configuration
- Nested layout support
- Template generation
- Loading states

**Example Usage:**
```bash
npx @ingenyus/swarm generate layout dashboard --metadata --loading
```

### Middleware Generator

Generates Next.js middleware with common patterns.

**Features:**
- Authentication checks
- Redirect logic
- Header manipulation
- Rate limiting setup

**Example Usage:**
```bash
npx @ingenyus/swarm generate middleware auth --redirect /login
```

## Astro

### Page Generator

Generates Astro pages with frontmatter and component structure.

**Features:**
- Frontmatter metadata
- Layout assignment
- Static/SSR/ISR mode
- Prerendering configuration

**Example Usage:**
```bash
npx @ingenyus/swarm generate page blog/[slug] --layout BlogLayout --prerender
npx @ingenyus/swarm generate page admin --ssr --layout AdminLayout
```

**Files Generated:**
- `src/pages/blog/[slug].astro`
- Frontmatter with metadata

### Component Generator

Creates Astro components with proper script/style blocks.

**Features:**
- Client-side hydration options (island architecture)
- Script and style blocks
- Props type generation
- Slot support

**Example Usage:**
```bash
npx @ingenyus/swarm generate component Card --client react --slots
npx @ingenyus/swarm generate component Hero --island svelte
```

### Layout Generator

Generates Astro layouts with HTML structure.

**Features:**
- HTML skeleton
- Meta tags
- SEO configuration
- Stylesheet imports

**Example Usage:**
```bash
npx @ingenyus/swarm generate layout Base --seo --styles
```

### Endpoint Generator

Creates API endpoints for Astro.

**Features:**
- GET/POST/PUT/DELETE support
- Request/Response handling
- TypeScript types
- Error responses

**Example Usage:**
```bash
npx @ingenyus/swarm generate endpoint /api/users --method GET
```

## Remix

### Route Generator

Generates Remix routes with loaders and actions.

**Features:**
- Loader function
- Action function
- Error boundary
- Catch boundary
- TypeScript types

**Example Usage:**
```bash
npx @ingenyus/swarm generate route products.$id --loader --action
npx @ingenyus/swarm generate route about --loader
```

**Files Generated:**
- `app/routes/products.$id.tsx`
- Loader and action exports

### Resource Route Generator

Creates resource routes (API routes) in Remix.

**Features:**
- HTTP method handlers
- JSON responses
- Error handling

**Example Usage:**
```bash
npx @ingenyus/swarm generate resource-route /api/users --methods GET,POST
```

### Component Generator

Generates Remix-aware components.

**Features:**
- Form components
- Link components
- Loading states
- Error boundaries

**Example Usage:**
```bash
npx @ingenyus/swarm generate component UserForm --form --validation
```

## SvelteKit

### Route Generator

Generates SvelteKit routes with load functions.

**Features:**
- +page.svelte
- +page.server.ts (load function)
- +page.ts (universal load)
- +layout files
- Error handling

**Example Usage:**
```bash
npx @ingenyus/swarm generate route products/[id] --server-load --layout
npx @ingenyus/swarm generate route about --universal-load
```

### API Route Generator

Creates SvelteKit API routes.

**Features:**
- GET/POST/PUT/DELETE handlers
- Request/Response types
- Error handling

**Example Usage:**
```bash
npx @ingenyus/swarm generate api-route /api/users --method POST
```

### Component Generator

Generates Svelte components with TypeScript.

**Features:**
- Props interface
- Reactive statements
- Stores integration
- Accessibility attributes

**Example Usage:**
```bash
npx @ingenyus/swarm generate component Button --props --reactive
```

## Nuxt.js

### Page Generator

Generates Nuxt pages with proper structure.

**Features:**
- Dynamic routes
- Layout assignment
- Meta tags
- Middleware assignment

**Example Usage:**
```bash
npx @ingenyus/swarm generate page products/[id] --layout default --meta
```

### Component Generator

Creates Nuxt components with auto-imports.

**Features:**
- Composables usage
- Auto-imports
- Props definition
- Emits definition

**Example Usage:**
```bash
npx @ingenyus/swarm generate component UserCard --composables --props
```

### API Route Generator

Generates Nuxt server API routes.

**Features:**
- Event handler
- Query/body parsing
- Response helpers
- TypeScript types

**Example Usage:**
```bash
npx @ingenyus/swarm generate api-route users --method POST
```

### Middleware Generator

Creates Nuxt middleware.

**Features:**
- Route guards
- Redirect logic
- Authentication checks

**Example Usage:**
```bash
npx @ingenyus/swarm generate middleware auth --redirect /login
```

## React Native

### Screen Generator

Generates React Native screens with navigation.

**Features:**
- Navigation props types
- Screen options
- Styling (StyleSheet or styled-components)
- Component structure

**Example Usage:**
```bash
npx @ingenyus/swarm generate screen Home --navigation react-navigation --styles
npx @ingenyus/swarm generate screen Profile --navigation expo-router
```

### Component Generator

Creates React Native components.

**Features:**
- Platform-specific code
- Styling options
- Props types
- Accessibility

**Example Usage:**
```bash
npx @ingenyus/swarm generate component Button --platform --styled-components
```

### Navigation Generator

Generates navigation configuration.

**Features:**
- Stack navigator
- Tab navigator
- Drawer navigator
- Type definitions

**Example Usage:**
```bash
npx @ingenyus/swarm generate navigation AppStack --type stack
npx @ingenyus/swarm generate navigation MainTabs --type tabs
```

## Express.js

### Route Generator

Generates Express routes with middleware.

**Features:**
- Route handlers (GET, POST, PUT, DELETE)
- Middleware integration
- Error handling
- Request validation
- Controller/Service pattern

**Example Usage:**
```bash
npx @ingenyus/swarm generate route /api/users --methods GET,POST --middleware auth,validate
npx @ingenyus/swarm generate route /api/products --controller --service
```

**Files Generated:**
- `routes/users.ts`
- `controllers/users.controller.ts`
- `services/users.service.ts`
- Optional middleware files

### Middleware Generator

Creates Express middleware functions.

**Features:**
- Authentication middleware
- Validation middleware
- Error handling middleware
- Logging middleware
- Rate limiting

**Example Usage:**
```bash
npx @ingenyus/swarm generate middleware auth --type jwt
npx @ingenyus/swarm generate middleware validate --schema userSchema
```

### Controller Generator

Generates Express controllers.

**Features:**
- CRUD operations
- Error handling
- Response formatting
- Service integration

**Example Usage:**
```bash
npx @ingenyus/swarm generate controller users --crud --service
```

## Fastify

### Route Generator

Generates Fastify routes with schemas.

**Features:**
- Route handlers
- JSON Schema validation
- TypeScript types from schemas
- Hook registration

**Example Usage:**
```bash
npx @ingenyus/swarm generate route /api/users --schema --hooks
```

### Plugin Generator

Creates Fastify plugins.

**Features:**
- Plugin structure
- Decorators
- Hooks
- Options schema

**Example Usage:**
```bash
npx @ingenyus/swarm generate plugin database --decorators --hooks
```

## tRPC

### Router Generator

Generates tRPC routers with procedures.

**Features:**
- Query procedures
- Mutation procedures
- Subscription procedures
- Input/output validation
- Middleware

**Example Usage:**
```bash
npx @ingenyus/swarm generate router users --procedures query,mutation --middleware auth
```

### Procedure Generator

Creates individual tRPC procedures.

**Features:**
- Input validation schema
- Output type
- Error handling
- Middleware chain

**Example Usage:**
```bash
npx @ingenyus/swarm generate procedure getUser --type query --input userSchema
```

## General Patterns

### CRUD Generator

Universal CRUD generator that works across frameworks.

**Features:**
- Create, Read, Update, Delete operations
- List/Detail views
- Form components
- API routes/endpoints
- Type definitions

**Example Usage:**
```bash
npx @ingenyus/swarm generate crud Product --framework nextjs --api --components
```

### Form Generator

Generates forms with validation.

**Features:**
- Form fields
- Validation schema (Zod/Yup)
- Error handling
- Submit handlers
- Framework-specific form libraries

**Example Usage:**
```bash
npx @ingenyus/swarm generate form UserRegistration --validation zod --framework react-hook-form
```

### Table Generator

Creates data tables with common features.

**Features:**
- Column definitions
- Sorting
- Filtering
- Pagination
- Framework-specific table libraries

**Example Usage:**
```bash
npx @ingenyus/swarm generate table Users --sorting --filtering --pagination
```

### Modal/Dialog Generator

Generates modal components.

**Features:**
- Open/close state management
- Accessibility (ARIA)
- Portal rendering
- Animations
- Framework-specific modal libraries

**Example Usage:**
```bash
npx @ingenyus/swarm generate modal ConfirmDialog --accessibility --animations
```

### Hook Generator

Creates custom React hooks (or equivalent for other frameworks).

**Features:**
- State management
- Side effects
- Return types
- Documentation

**Example Usage:**
```bash
npx @ingenyus/swarm generate hook useFetch --async --caching
```

### Utility Generator

Generates utility functions.

**Features:**
- Type definitions
- Tests
- Documentation
- Example usage

**Example Usage:**
```bash
npx @ingenyus/swarm generate utility formatCurrency --types --tests
```

### Test Generator

Generates test files for existing code.

**Features:**
- Unit tests
- Integration tests
- Test utilities
- Mock setup
- Coverage configuration

**Example Usage:**
```bash
npx @ingenyus/swarm generate test UserService --framework vitest --mocks
```

### Type/Interface Generator

Generates TypeScript types from schemas or examples.

**Features:**
- Zod schema to TypeScript types
- JSON Schema to TypeScript types
- API response types
- Database model types

**Example Usage:**
```bash
npx @ingenyus/swarm generate types User --from zod --output types/user.ts
```

### Documentation Generator

Creates documentation files.

**Features:**
- API documentation
- Component documentation
- Usage examples
- JSDoc comments

**Example Usage:**
```bash
npx @ingenyus/swarm generate docs UserAPI --format markdown --examples
```

## Implementation Tips

### Framework Detection

Generators can detect the framework automatically:

```typescript
import { findPackageJson } from '@ingenyus/swarm';

async detectFramework(): Promise<string> {
  const pkg = await findPackageJson();
  if (pkg.dependencies?.next) return 'nextjs';
  if (pkg.dependencies?.astro) return 'astro';
  if (pkg.dependencies?.remix) return 'remix';
  return 'unknown';
}
```

### Template Variants

Use template variants for different frameworks:

```
templates/
  component/
    nextjs.eta
    astro.eta
    remix.eta
    svelte.eta
```

### Configuration Integration

Read framework-specific config files:

```typescript
// Next.js
const nextConfig = await loadConfig('next.config.js');

// Astro
const astroConfig = await loadConfig('astro.config.mjs');

// Remix
const remixConfig = await loadConfig('remix.config.js');
```

### Type Generation

Generate types from existing patterns:

```typescript
// Infer types from API routes
const apiTypes = await inferTypesFromRoutes('app/api');

// Generate types from database schema
const dbTypes = await generateTypesFromPrisma('schema.prisma');
```

## Contributing

If you build a generator for any of these frameworks, consider:

1. **Sharing your plugin** - Publish to npm and share with the community
2. **Documentation** - Create clear examples and usage guides
3. **Testing** - Include comprehensive tests
4. **Feedback** - Gather user feedback and iterate

## Resources

- [Plugin Development Guide](./PLUGIN_DEVELOPMENT.md) - Learn how to build plugins
- [Swarm Wasp Plugin](../packages/swarm-wasp) - Complete plugin example
- [ETA Templates](https://eta.js.org/) - Template engine documentation
- [Zod](https://zod.dev/) - Schema validation library

