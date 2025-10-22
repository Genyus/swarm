# @ingenyus/swarm

## 0.3.0

### Minor Changes

- [`0d5ea96`](https://github.com/Genyus/swarm/commit/0d5ea964b12aa77c1fa28393bccd826435222c3c) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - Multiple changes:
  - restructure monorepo
  - migrate all Wasp references to swarm-wasp
  - merge swarm-config into swarm-wasp
  - refactor template handling
  - ensure parent features exist
  - rename logger export
  - remove Hungarian notation from interfaces
  - complete Hungarian notation removal and fix type issues
  - complete naming convention improvements
  - improve types and fix test imports in utils and generators
  - update imports to use barrel paths
  - resolve test failures after refactoring
  - renamed swarm-core to swarm
  - remove relation fields from metadata
  - improve operation code generation with consistent field helpers and type utilities
  - add comprehensive support for Prisma composite primary keys
  - prevent full stack trace display for user-facing errors
  - normalise error messages
  - improve api generator arguments
  - implement 'create' command

## 0.2.0

### Minor Changes

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(cli): implement type safety for command arguments
  - Add ambient module for Commander
  - Introduce new CommandFactory class for creating type-safe CLI commands
  - Replace previous command registration methods with new CommandBuilder class
  - Add Zod schemas for consistent argument validation across commands
  - Remove obsolete functions

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): update templates to render swarm-config methods
  - Generate fluent methods instead of config objects
  - Update tests

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat: implement 'create' command
  - Enable creation of new projects from starter template repos
  - Update documentation to reflect new package structure

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): enable custom API middleware
  - Add customMiddleware parameter to API generator that enables construction of custom middleware function

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(mcp): add support for custom middleware

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(swarm-wasp): add optional custom name parameter to action and query generators
  - Add optional 'name' parameter to action and query generator schemas
  - Update ActionGenerator and QueryGenerator to extract and pass custom name
  - Modify OperationGeneratorBase.getOperationName to accept customName parameter
  - Preserve schema metadata when making name parameter optional using extend()
  - Update ActionFlags and QueryFlags types to include name property
  - Add test coverage for custom operation names

  Resolves Task #44

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(wasp-config): implement semicolon normalisation in config files
  - Add normaliseSemicolons() method to handle user-added semicolons
  - Remove semicolons from all method calls in app chain
  - Automatically add semicolon to the last method call
  - Preserve semicolons outside the method chain
  - Add comprehensive test coverage for semicolon handling

  Resolves issues where manually added semicolons would break
  subsequent config insertions by normalising semicolon usage
  consistently across all feature configuration files.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): implement alphabetical ordering for config sections
  - Replaces custom, hard-coded sort order with alphabetical ordering

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): implement template overriding
  - Enable overriding built-in templates
  - Set .swarm/templates as default custom template location

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(wasp): auto-include datatype in entities array for actions and queries
  - Automatically add dataType to entities array if not already present
  - Place dataType first in the array using unshift()
  - Maintain backward compatibility with explicit entity specification
  - Prevent duplicate dataType entries with includes() check
  - Add test scaffolding for new behavior (tests partially complete)

  This eliminates the need to manually specify the dataType in the
  -e flag when generating actions and queries, as the generator already
  knows which model it's operating on from the -d flag.

  Resolves task #45

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): migrate code from swarm-mcp and swarm-cli

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat: add comprehensive support for Prisma composite primary keys

  Add full support for models using @@id([field1, field2]) composite keys:

  **Schema Parsing:**
  - Parse @@id attribute to detect composite primary keys
  - Extract field names from composite key definition
  - Mark all composite key fields with isId: true in metadata

  **Field Helper Functions:**
  - Update getIdFields to return all ID fields as array (single or composite)
  - Exclude ID fields from getRequiredFields (they may not be auto-generated)

  **Operation Code Generation:**
  - Detect composite keys and generate appropriate where clauses
  - Single key: where: { id }
  - Composite key: where: { userId_projectId: { userId, projectId } }
  - Update function parameters to destructure all ID fields
  - Support for get, delete, update operations with composite keys

  **Template Updates:**
  - Update get.eta to use idFieldParams and whereClause
  - Update delete.eta to use idFieldParams and whereClause
  - Maintain backward compatibility with single primary keys

  **Tests:**
  - Add mockCompositeKeyModel with userId/projectId composite key
  - Test getIdFields returns multiple fields for composite keys
  - Test getRequiredFields excludes composite key fields
  - Test generatePickType handles composite key fields
  - All 23 prisma.test.ts tests passing

  Verified with UserProject model: @@id([userId, projectId])
  - create: Pick<UserProject, "userId" | "projectId">
  - get/delete: where: { userId_projectId: { userId, projectId } }

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(config): create swarm-config package
  - Defines wrapper around wasp-config to enable fluent configuration methods and configuration splitting

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): improve config function insertion
  - Implement ordered grouping with comment headers
  - Apply default Prettier formatting (double quotes) for templates
  - Improve type safety of addJob method

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(wasp): add swarm-wasp package boilerplate

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): update type params
  - Make typing more explicit for delete actions and get queries

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat: remove relation fields from metadata
  - Filter out array and relation fields to match Wasp entities

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(mcp): improve interface and tool naming
  - Change `swarm_generation_` prefix to `generate_wasp_`
  - Remove redundant `Swarm` prefix from interfaces
  - Remove unused interfaces

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat: improve api generator arguments
  - Add custom middleware metadata

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(swarm-wasp): improve create operations
  - Handle default values and foreign keys in create operations
  - Add getOptionalFields() helper to identify fields with non-DateTime defaults
  - Update getOmitFields() to exclude fields with default values and foreign keys
  - Modify create operation type generation to make optional fields truly optional
  - Fields with defaults (except DateTime) are now properly optional in create types
  - Foreign key fields are automatically excluded from create operations

  Example: Task with 'isDone' boolean default(false) now generates:
  Omit<Task, 'id' | 'userId' | 'isDone'> & { isDone?: boolean }

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): add support for `getFiltered` queries

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): overhaul feature configuration templates
  - Modify configuration templates to use the new fluent method pattern from swarm-config
  - Modify the feature generation to place configuration files within feature directories
  - Modify feature configuration scanning to look in feature directories
  - Update all tests
  - Fix build configuration for swarm-mcp package

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): update directory structure
  - Remove `_core` container and add `features` container for sub-features
  - Implement full support for nested feature directories

### Patch Changes

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - docs(wasp): add sample config file

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(wasp): reorganize directory structure
  - Moved base-classes/ to generators/base/
  - Renamed utils/ to common/
  - Moved interface files:
    - generator-args.ts -> generators/args.types.ts
    - prisma.ts -> types/prisma.types.ts
    - wasp-config-generator.ts -> generators/config/config-generator.ts
  - Reorganized wasp-config structure (swapped stubs/wasp-config to wasp-config/stubs)
  - Moved app.ts and config-index.ts into wasp-config/
  - Moved test-setup.ts to tests/setup.ts
  - Updated vitest.config.ts to reference new test setup location
  - Updated all imports across package
  - Added tsconfig paths mapping for wasp-config module resolution
  - Added skipLibCheck to tsconfig.dts.json

  Part of Phase 2.2 - swarm-wasp directory reorganization.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): handle missing config file gracefully
  - Create default configuration object instead of throwing error when config file not found
  - Replace hard-coded configuration directory and file paths with constants

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: renamed swarm-core to swarm
  - Removed name property from root package.json to avoid conflict

  Verification:
  ✅ both packages build successfully
  ✅ All tests passing (swarm: 185/185, swarm-wasp: 104/107)

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - test: fix api-generator test after refactoring
  - Updated import to use './api-generator' instead of './generator'
  - Changed type from Generator<string> to SwarmGenerator<{ path: string }>
  - Removed access to protected class properties (path, checkConfigExists)
  - Simplified template mocking to not access internal implementation
  - Properly mock config template to return valid config definition
  - Added resolveTemplatePath mock to templateUtility for second test
  - All tests now passing

  Fixes linter errors and test failures after generator file renaming.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): consolidate schema introspection
  - Add SchemaAnalyser utility class to centralise Zod schema handling
  - Update CommandFactory and ToolFactory to use new class
  - Replace use of deprecated private \_def property with public API (\_zod.def)
  - Add tests

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): implement plugin resolution
  - Add support for npm packages and local plugin resolution

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix: prevent full stack trace display for user-facing errors

  Change error logging in handleGeneratorError from error.stack to error.message
  to provide clean, user-friendly error output instead of verbose stack traces.

  Previously when a generator failed (e.g., file already exists), users would see
  the full stack trace with internal file paths and line numbers. Now they see
  only the clean error message.

  Before:
  [Swarm] › ✖ error Failed to generate Action: Error: Operation file already exists
  at ActionGenerator.checkExistence (file:///.../dist/index.js:1346:13)
  at ActionGenerator.checkFileExists (file:///.../dist/index.js:1355:17)
  ... [many more lines]

  After:
  [Swarm] › ✖ error Failed to generate Action: Operation file already exists

  Stack traces can still be shown when SWARM_DEBUG=1 is set via the error()
  utility function in common/errors.ts.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - docs(cli): update command documentation

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): rename BaseGenerator to GeneratorBase and SwarmLogger to SignaleLogger
  - Renamed BaseGenerator class to GeneratorBase following naming convention
  - Renamed SwarmLogger class to SignaleLogger for clarity
  - Renamed base-generator.ts to generator.base.ts
  - Renamed logger.ts to signale-logger.ts
  - Updated all imports across swarm-core and swarm-wasp packages
  - Updated all references in MCP server files and test files

  Part of Phase 1.1 of code structure refactoring plan.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - style(core): minor template formatting

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: improve types and fix test imports in utils and generators
  - Added underscores to unused parameters in mock functions
  - Added proper type annotations (FileSystem, string | Buffer, etc.)
  - Fixed test imports to use renamed generator files (\*-generator.ts)
  - Updated Generator<string> to SwarmGenerator<{ path: string }> in all tests
  - Added template utility mocks to generator tests for getDefinition
  - Added type cast for template processing (as string, String())
  - Fixed importActual type annotation for @ingenyus/swarm-core

  All generator unit tests now passing.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(cli): rename files for consistency

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(swarm-wasp): split operation generator into action and query generators
  - Refactor OperationGenerator into ActionGenerator and QueryGenerator
  - ActionGenerator handles create, update, delete operations
  - QueryGenerator handles get, getAll, getFiltered operations
  - Extract common logic to OperationGeneratorBase
  - Update all tests to use new generators
  - Fix template path resolution for config templates
  - Minimize code duplication while maintaining clear separation of concerns

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(cli): define short arguments correctly

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): Fix insertion ordering

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): implement generator base class
  - Fix job generator

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): switch to default Eta delimiters
  - Avoids issues with JS interpolation syntax

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): fix config insertion bug
  - Replaces overly lax condition to avoid commented lines being counted

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - docs(cli): updates project structure

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build(mcp): fix tsconfig include/exclude rules

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: remove Knip script from sub-packages

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: restructure monorepo
  - Merge base functionality from swarm-cli and swarm-mcp into swarm-core
  - Implement metadata-driven generation for CLI commands and MCP tools
  - Extract Wasp entity generators into new swarm-wasp package

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(cli): fix casing bug in operation command
  - Makes data-type argument case-insensitive
  - Add short-form argument keys

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix: complete Hungarian notation removal and fix type issues
  - Fixed remaining FileSystem import issues
  - Removed duplicate base class files that weren't properly deleted
  - Fixed FeatureDirectoryGenerator type from Generator<string> to SwarmGenerator<SchemaArgs>
  - Updated entity-generator.base.ts to use correct type parameter
  - Fixed test mock to match correct SwarmGenerator interface
  - Removed IFeatureDirectoryGenerator export from package index
  - All builds now passing

  Part of Phase 1.3 completion.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix: ensure parent features exist
  - Validates existence of current and any ancestor features
  - Fix feature directory generator param typing
  - Update tests

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: install Knip

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(wasp): rename base classes to use Base suffix
  - Renamed BaseWaspGenerator to WaspGeneratorBase
  - Renamed BaseEntityGenerator to EntityGeneratorBase
  - Renamed BaseOperationGenerator to OperationGeneratorBase
  - Renamed files to use .base.ts suffix convention:
    - base-wasp-generator.ts → wasp-generator.base.ts
    - base-entity-generator.ts → entity-generator.base.ts
    - base-operation-generator.ts → operation-generator.base.ts
  - Updated all imports and class extensions across all generators

  Part of Phase 1.2 of code structure refactoring plan.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix: resolve test failures after refactoring

  Fixed template path resolution issues:
  - Updated TemplateUtility.resolveTemplatePath to account for new base class location
    (generators/base/ instead of base-classes/)
  - Fixed operation generator config template path construction
    (removed extra 'generators' in path join)

  Fixed Prisma mock paths in tests:
  - Updated all test files to mock '../src/common/prisma' instead of '../src/utils/prisma'
  - Affected files:
    - json-field-handling.test.ts
    - crud-generation.test.ts
    - error-handling.test.ts
    - complete-workflow.test.ts
    - edge-cases.test.ts
    - performance-stress.test.ts
    - operation-generation.test.ts
    - configuration-validation.test.ts

  All 107 swarm-wasp tests now passing (3 skipped).

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - chore: configure Knip and fix issues

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: refactor template handling
  - Migrate template handling from swarm-core to swarm-wasp
  - Refactor tests

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: standardise scripts
  - add validate step to build and run all checks
  - replace `rm -rf` with `rimraf`

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: centralise TS, ESLint and Prettier configs
  - Define workspace-level configuration and inherit from individual packages
  - Fix linting errors

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(mcp): propagate generator errors to MCP clients
  - Return appropriate status when generator methods fail
  - Refactor SwarmTools to eliminate code duplication

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): remove obsolete method

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: update validate scripts to fix any issues

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - test(wasp): overhaul integration tests
  - Replace loose mocked tests with physical file generation and validation
  - Generate a minimal Wasp application to test against
  - Switch to single-fork execution to prevent test interference

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): remove entity suffixing

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - style: apply Prettier formatting

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): enable operation generation
  - Fix logic and templates for actions and queries

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: complete naming convention improvements

  Naming Convention Updates:
  - Renamed all generator files to follow \*-generator.ts convention
    - api/generator.ts -> api/api-generator.ts
    - crud/generator.ts -> crud/crud-generator.ts
    - config/generator.ts -> config/wasp-config-generator.ts
    - feature-directory/generator.ts -> feature-directory/feature-directory-generator.ts
    - job/generator.ts -> job/job-generator.ts
    - operation/generator.ts -> operation/operation-generator.ts
    - route/generator.ts -> route/route-generator.ts
    - api-namespace/generator.ts -> api-namespace/api-namespace-generator.ts
  - Renamed mcp/server/utils/ to mcp/server/common/ for consistency

  New Index Files (Barrel Exports):
  - Added contracts/index.ts with explicit type exports
  - Added generator/index.ts exporting GeneratorBase
  - Added plugin/index.ts with proper type/value exports
  - Added generators/base/index.ts for base classes
  - Added generators/config/index.ts
  - Added types/index.ts with correct exports
  - Updated mcp/server/common/index.ts with explicit exports

  Export Improvements:
  - Converted high-level barrel exports to explicit named exports
  - Fixed types/index.ts to only export types that actually exist
  - Kept wildcard exports for utility directories (common/)
  - Used 'export type' for interfaces to satisfy isolatedModules

  All imports updated and builds passing successfully.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): rebuild Prisma utils on AST parsing
  - Replace relying on private \_runtimeDataModel in favour of prisma-ast library

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: install rimraf locally

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(config): fix linting error

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): reorganize directory structure
  - Renamed base-classes/ to generator/
  - Created contracts/ directory for API boundaries
  - Moved interface files to contracts/
  - Renamed utils/ to common/
  - Renamed plugin files for clarity (manager.ts -> plugin-manager.ts, etc.)
  - Moved generator-interface-manager.ts to plugin/
  - Updated all imports across packages
  - Removed leftover interfaces/ directory

  Part of Phase 2.1 - swarm-core directory reorganization.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(config): temporary import path fix
  - Hard-codes `_code` as feature sub-directory, will be removed when implementing homogenous feature directories

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - test(core): utilise partial mocking pattern
  - Avoid test errors when making unrelated code changes

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: improve operation code generation with consistent field helpers and type utilities
  - Rename getIdField to getIdFields returning string[] for consistency
  - Replace getOmitFields with getRequiredFields for clearer intent
  - Update getOptionalFields to return string[] instead of Record<string, string>
  - Add generatePickType helper for Pick type generation with optimisations
  - Add generateOmitType helper for Omit type generation with optimisations
  - Add generatePartialType helper for Partial type wrapping
  - Add generateIntersectionType helper for type intersection logic
  - Refactor generateOperationCode to use new helpers for cleaner type assembly
  - Update all test mocks to match new function signatures
  - Add comprehensive unit tests for new type generation helpers

  Operation-specific type parameters now use:
  - create: Pick<required> & Partial<Pick<optional>>
  - update: Pick<id> & Partial<Omit<id>>
  - get/delete: Pick<id>
  - getAll: void
  - getFiltered: Partial<Model>

  All tests passing (133 passed, 3 skipped)

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): prevent casing mis-match

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): fix route configuration format

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): improve logging output

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - style(core): apply Prettier formatting

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: update imports to use barrel paths

  swarm-core:
  - Updated contracts imports to use '../contracts' barrel
  - Updated common imports to use '../common' barrel
  - Updated plugin imports to use '../plugin' barrel
  - Fixed GeneratorInterfaceManager export (class, not type)

  swarm-wasp:
  - Updated base generator imports to use '../base' barrel
  - Updated common imports to use '../../common' barrel
  - Reverted WaspGeneratorBase to direct import to avoid circular resolution
  - All schema files now import from common barrel

  Benefits:
  - Cleaner imports throughout the codebase
  - Better encapsulation of module boundaries
  - Easier to refactor internal structure without breaking imports
  - More maintainable codebase

  All tests passing.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - chore: update dependencies
  - Remove eslint-plugin-prettier

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: rename logger export
  - Remove obsolete backup files
  - Update tests

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(swarm-wasp): Phase 3 - eliminate duplication and reduce complexity

  Code Optimization Changes:
  1. Consolidated Config Update Pattern
     - Added updateConfigWithCheck helper to EntityGeneratorBase
     - Refactored 6 generators (api, route, job, operation, crud, api-namespace)
     - Eliminated duplicate config update logic across all generators
  2. Consolidated Validation Logic
     - Added generic checkExistence method to WaspGeneratorBase
     - Refactored checkFileExists and checkConfigExists to use new helper
     - Reduced code duplication in validation patterns
  3. Removed Redundant Wrapper Methods
     - Removed getFeatureImportPath wrappers from both base classes
     - Updated ApiGenerator to use utility function directly
     - Cleaned up unused imports
  4. Verified MCP Error Handling
     - Audited MCP tools error handling patterns
     - Confirmed existing error-handler.ts consolidation is sufficient
     - No changes needed - already well-architected

  Results:
  ✅ -14 net lines of code
  ✅ Improved maintainability through reduced duplication
  ✅ All tests passing (swarm-core: 185/185, swarm-wasp: 104/107)
  ✅ Full validation suite passing (lint, typecheck, build, test)
  ✅ No functional changes introduced

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): simplify route generation
  - Remove explicit component name definition

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - revert: remove unintentionally restored packages

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(mcp): replace local types with core ones

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): fix CRUD generator command
  - Add missing dataType argument
  - Stop optional arguments being treated as required
  - Fix incorrect await usage with non-async getDefinition method
  - Unify generators directory in core package
  - Improve CRUD generation test suite

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): simplify feature command
  - Rename from 'feature-directory' to 'feature'

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - chore: clean up unused types
  - Removed dead code

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - test(core): enable test runner

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - chore: complete refactoring - knip ignore rules and final cleanup

  Added Knip ignore rules:
  - Ignore @commander-js/extra-typings (swarm-core CLI dependency)
  - Ignore wasp-config (swarm-wasp test stub)

  Additional cleanup in this commit:
  - Updated SwarmConfig references to SwarmConfigManager
  - Fixed remaining import paths after refactoring
  - Added missing barrel index.ts files for generator subdirectories
  - Removed accidentally created tests/index.ts
  - Updated all generator imports to use barrel paths

  Summary of complete refactoring:
  ✅ Phase 1: Naming conventions (Base suffix, .base.ts files)
  ✅ Phase 2: Directory structure (utils→common, interfaces→contracts, base-classes→generators/base)
  ✅ Phase 3: Barrel files (index.ts) with explicit exports
  ✅ Phase 4: Updated all imports to use barrel paths
  ✅ Phase 5: Fixed all test mocks and template paths
  ✅ Phase 6: Resolved Knip false positives

  All tests passing:
  - swarm-core: 185/185 tests ✓
  - swarm-wasp: 104/107 tests ✓ (3 skipped)

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(mcp): synchronise MCP tools with CLI commands
  - Update API, CRUD and job parameters to match CLI
  - Split operation generator tool into separate action and query tools

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): update template variables

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix: normalise error messages
  - Align success and failure messages
  - Remove redundant messages

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - revert(swarm-wasp): restore config update logic
  - Restore previous insertion logic that agent over-simplified
  - Add proper config file content to readFileSync mocks
  - Update template mocks to match actual config template format (.addX chaining)
  - Remove utf8 encoding parameter from test expectations (not used in actual code)
  - All tests now passing with restored config update behavior

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: remove Hungarian notation from interfaces
  - Renamed IFileSystem to FileSystem
  - Renamed IWaspConfigGenerator to ConfigGenerator
  - Removed IFeatureDirectoryGenerator interface entirely, replaced with Generator<string>
  - Updated all imports and references across both packages
  - Deleted feature-directory-generator.ts interface file

  Part of Phase 1.3 of code structure refactoring plan.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): refactor generators
  - Add abstract entityType property to reduce duplicate strings

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): implement CRUD generation
  - refactors operation generator to support CRUD operations

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: migrate all Wasp references to swarm-wasp

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - chore: add changesets for release [skip ci]

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): simplify generator API
  - Add default constructor parameter values
  - Remove constructor parameters from all invocations
  - Remove generator property from Command interface
  - Update @types/node to enable working node:fs imports

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build(mcp): fix TS configuration

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: update compiler target to es2022

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): implement Eta templating
  - Replace regex-based template transformation with Eta engine

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(config): improve template resolution

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - test: relocate test files

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: merge swarm-config into swarm-wasp

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): extend optional field support
  - Implement optional fields for update actions and getFiltered queries
